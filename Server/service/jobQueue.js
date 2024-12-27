const QUEUE_NAME = "monitors";
const JOBS_PER_WORKER = 5;
const SERVICE_NAME = "JobQueue";

import { errorMessages, successMessages } from "../utils/messages.js";
/**
 * JobQueue
 *
 * This service is responsible for managing the job queue.
 * It handles enqueuing, dequeuing, and processing jobs.
 * It scales the number of workers based on the number of jobs/worker
 */
class JobQueue {
	static SERVICE_NAME = SERVICE_NAME;
	/**
	 * @class JobQueue
	 * @classdesc Manages job queue and workers.
	 *
	 * @param {Object} statusService - Service for handling status updates.
	 * @param {Object} notificationService - Service for handling notifications.
	 * @param {Object} settingsService - Service for retrieving settings.
	 * @param {Object} logger - Logger for logging information.
	 * @param {Function} Queue - Queue constructor.
	 * @param {Function} Worker - Worker constructor.
	 */
	constructor(
		statusService,
		notificationService,
		settingsService,
		logger,
		Queue,
		Worker
	) {
		const settings = settingsService.getSettings() || {};

		const { redisHost = "127.0.0.1", redisPort = 6379 } = settings;
		const connection = {
			host: redisHost,
			port: redisPort,
		};
		this.queue = new Queue(QUEUE_NAME, {
			connection,
		});
		this.connection = connection;
		this.workers = [];
		this.db = null;
		this.networkService = null;
		this.statusService = statusService;
		this.notificationService = notificationService;
		this.settingsService = settingsService;
		this.logger = logger;
		this.Worker = Worker;
	}

	/**
	 * Creates and initializes a JobQueue instance.
	 *
	 * @param {Object} db - Database service for accessing monitors.
	 * @param {Object} networkService - Service for network operations.
	 * @param {Object} statusService - Service for handling status updates.
	 * @param {Object} notificationService - Service for handling notifications.
	 * @param {Object} settingsService - Service for retrieving settings.
	 * @param {Object} logger - Logger for logging information.
	 * @param {Function} Queue - Queue constructor.
	 * @param {Function} Worker - Worker constructor.
	 * @returns {Promise<JobQueue>} - The initialized JobQueue instance.
	 * @throws {Error} - Throws an error if initialization fails.
	 */
	static async createJobQueue(
		db,
		networkService,
		statusService,
		notificationService,
		settingsService,
		logger,
		Queue,
		Worker
	) {
		const queue = new JobQueue(
			statusService,
			notificationService,
			settingsService,
			logger,
			Queue,
			Worker
		);
		try {
			queue.db = db;
			queue.networkService = networkService;
			const monitors = await db.getAllMonitors();
			for (const monitor of monitors) {
				if (monitor.isActive) {
					await queue.addJob(monitor.id, monitor);
				}
			}
			const workerStats = await queue.getWorkerStats();
			await queue.scaleWorkers(workerStats);
			return queue;
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "createJobQueue") : null;
			throw error;
		}
	}

	/**
	 * Checks if the given monitor is in a maintenance window.
	 *
	 * @param {string} monitorId - The ID of the monitor to check.
	 * @returns {Promise<boolean>} - Returns true if the monitor is in a maintenance window, otherwise false.
	 * @throws {Error} - Throws an error if the database query fails.
	 */
	async isInMaintenanceWindow(monitorId) {
		const maintenanceWindows = await this.db.getMaintenanceWindowsByMonitorId(monitorId);
		// Check for active maintenance window:
		const maintenanceWindowIsActive = maintenanceWindows.reduce((acc, window) => {
			if (window.active) {
				const start = new Date(window.start);
				const end = new Date(window.end);
				const now = new Date();
				const repeatInterval = window.repeat || 0;

				// If start is < now and end > now, we're in maintenance
				if (start <= now && end >= now) return true;

				// If maintenance window was set in the past with a repeat,
				// we need to advance start and end to see if we are in range

				while (start < now && repeatInterval !== 0) {
					start.setTime(start.getTime() + repeatInterval);
					end.setTime(end.getTime() + repeatInterval);
					if (start <= now && end >= now) {
						return true;
					}
				}
				return false;
			}
			return acc;
		}, false);
		return maintenanceWindowIsActive;
	}

	/**
	 * Creates a job handler function for processing jobs.
	 *
	 * @returns {Function} An async function that processes a job.
	 */
	createJobHandler() {
		return async (job) => {
			try {
				// Get all maintenance windows for this monitor
				const monitorId = job.data._id;
				const maintenanceWindowActive = await this.isInMaintenanceWindow(monitorId);
				// If a maintenance window is active, we're done

				if (maintenanceWindowActive) {
					this.logger.info({
						message: `Monitor ${monitorId} is in maintenance window`,
						service: SERVICE_NAME,
						method: "createWorker",
					});
					return;
				}

				// Get the current status
				const networkResponse = await this.networkService.getStatus(job);
				// Handle status change
				const { monitor, statusChanged, prevStatus } =
					await this.statusService.updateStatus(networkResponse);
				// Handle notifications
				this.notificationService.handleNotifications({
					...networkResponse,
					monitor,
					prevStatus,
					statusChanged,
				});
			} catch (error) {
				this.logger.error({
					message: error.message,
					service: error.service ?? SERVICE_NAME,
					method: error.method ?? "createJobHandler",
					details: `Error processing job ${job.id}: ${error.message}`,
					stack: error.stack,
				});
			}
		};
	}

	/**
	 * Creates a worker for the queue
	 * Operations are carried out in the async callback
	 * @returns {Worker} The newly created worker
	 */
	createWorker() {
		const worker = new this.Worker(QUEUE_NAME, this.createJobHandler(), {
			connection: this.connection,
		});
		return worker;
	}

	/**
	 * @typedef {Object} WorkerStats
	 * @property {Array<Job>} jobs - Array of jobs in the Queue
	 * @property {number} - workerLoad - The number of jobs per worker
	 *
	 */

	/**
	 * Gets stats related to the workers
	 * This is used for scaling workers right now
	 * In the future we will likely want to scale based on server performance metrics
	 * CPU Usage & memory usage, if too high, scale down workers.
	 * When to scale up?  If jobs are taking too long to complete?
	 * @async
	 * @returns {Promise<WorkerStats>} - Returns the worker stats
	 */
	async getWorkerStats() {
		try {
			const jobs = await this.queue.getRepeatableJobs();
			const load = jobs.length / this.workers.length;
			return { jobs, load };
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "getWorkerStats") : null;
			throw error;
		}
	}

	/**
   * Scale Workers
   * This function scales workers based on the load per worker
   * If the load is higher than the JOBS_PER_WORKER threshold, we add more workers
   * If the load is lower than the JOBS_PER_WORKER threshold, we release workers
   * This approach ignores server performance, which we should add in the future
   *

   * @async
   * @param {WorkerStats} workerStats - The payload for the job.
   * @returns {Promise<boolean>}
   */
	async scaleWorkers(workerStats) {
		if (this.workers.length === 0) {
			// There are no workers, need to add one
			for (let i = 0; i < 5; i++) {
				const worker = this.createWorker();
				this.workers.push(worker);
			}
			return true;
		}
		if (workerStats.load > JOBS_PER_WORKER) {
			// Find out how many more jobs we have than current workers can handle
			const excessJobs = workerStats.jobs.length - this.workers.length * JOBS_PER_WORKER;
			// Divide by jobs/worker to find out how many workers to add
			const workersToAdd = Math.ceil(excessJobs / JOBS_PER_WORKER);
			for (let i = 0; i < workersToAdd; i++) {
				const worker = this.createWorker();
				this.workers.push(worker);
			}
			return true;
		}

		if (workerStats.load < JOBS_PER_WORKER) {
			// Find out how much excess capacity we have
			const workerCapacity = this.workers.length * JOBS_PER_WORKER;
			const excessCapacity = workerCapacity - workerStats.jobs.length;
			// Calculate how many workers to remove
			let workersToRemove = Math.floor(excessCapacity / JOBS_PER_WORKER); // Make sure there are always at least 5
			while (workersToRemove > 0 && this.workers.length > 5) {
				const worker = this.workers.pop();
				workersToRemove--;
				await worker.close().catch((error) => {
					// Catch the error instead of throwing it
					this.logger.error({
						message: error.message,
						service: SERVICE_NAME,
						method: "scaleWorkers",
						stack: error.stack,
					});
				});
			}
			return true;
		}
		return false;
	}

	/**
	 * Gets all jobs in the queue.
	 *
	 * @async
	 * @returns {Promise<Array<Job>>}
	 * @throws {Error} - Throws error if getting jobs fails
	 */
	async getJobs() {
		try {
			const jobs = await this.queue.getRepeatableJobs();
			return jobs;
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "getJobs") : null;
			throw error;
		}
	}

	/**
	 * Retrieves the statistics of jobs and workers.
	 *
	 * @returns {Promise<Object>} - An object containing job statistics and the number of workers.
	 * @throws {Error} - Throws an error if the job statistics retrieval fails.
	 */
	async getJobStats() {
		try {
			const jobs = await this.queue.getJobs();
			const ret = await Promise.all(
				jobs.map(async (job) => {
					const state = await job.getState();
					return { url: job.data.url, state };
				})
			);
			return { jobs: ret, workers: this.workers.length };
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "getJobStats") : null;
			throw error;
		}
	}

	/**
	 * Adds a job to the queue and scales workers based on worker stats.
	 *
	 * @async
	 * @param {string} jobName - The name of the job to be added.
	 * @param {Monitor} payload - The payload for the job.
	 * @throws {Error} - Will throw an error if the job cannot be added or workers don't scale
	 */
	async addJob(jobName, payload) {
		try {
			this.logger.info({ message: `Adding job ${payload?.url ?? "No URL"}` });
			// Execute job immediately
			await this.queue.add(jobName, payload);
			await this.queue.add(jobName, payload, {
				repeat: {
					every: payload?.interval ?? 60000,
				},
			});
			const workerStats = await this.getWorkerStats();
			await this.scaleWorkers(workerStats);
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "addJob") : null;
			throw error;
		}
	}

	/**
	 * Deletes a job from the queue.
	 *
	 * @async
	 * @param {Monitor} monitor - The monitor to remove.
	 * @throws {Error}
	 */
	async deleteJob(monitor) {
		try {
			const wasDeleted = await this.queue.removeRepeatable(monitor._id, {
				every: monitor.interval,
			});
			if (wasDeleted === true) {
				this.logger.info({
					message: successMessages.JOB_QUEUE_DELETE_JOB,
					service: SERVICE_NAME,
					method: "deleteJob",
					details: `Deleted job ${monitor._id}`,
				});
				const workerStats = await this.getWorkerStats();
				await this.scaleWorkers(workerStats);
			} else {
				this.logger.error({
					message: errorMessages.JOB_QUEUE_DELETE_JOB,
					service: SERVICE_NAME,
					method: "deleteJob",
					details: `Failed to delete job ${monitor._id}`,
				});
			}
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "deleteJob") : null;
			throw error;
		}
	}

	/**
	 * Retrieves the metrics of the job queue.
	 *
	 * @returns {Promise<Object>} - An object containing various job queue metrics.
	 * @throws {Error} - Throws an error if the metrics retrieval fails.
	 */
	async getMetrics() {
		try {
			const metrics = {
				waiting: await this.queue.getWaitingCount(),
				active: await this.queue.getActiveCount(),
				completed: await this.queue.getCompletedCount(),
				failed: await this.queue.getFailedCount(),
				delayed: await this.queue.getDelayedCount(),
				repeatableJobs: (await this.queue.getRepeatableJobs()).length,
			};
			return metrics;
		} catch (error) {
			this.logger.error({
				message: error.message,
				service: SERVICE_NAME,
				method: "getMetrics",
				stack: error.stack,
			});
		}
	}

	/**
	 * @async
	 * @returns {Promise<boolean>} - Returns true if obliteration is successful
	 */

	async obliterate() {
		try {
			this.logger.info({ message: "Attempting to obliterate job queue..." });
			await this.queue.pause();
			const jobs = await this.getJobs();

			// Remove all repeatable jobs
			for (const job of jobs) {
				await this.queue.removeRepeatableByKey(job.key);
				await this.queue.remove(job.id);
			}

			// Close workers
			await Promise.all(
				this.workers.map(async (worker) => {
					await worker.close();
				})
			);

			await this.queue.obliterate();
			const metrics = await this.getMetrics();
			this.logger.info({
				message: successMessages.JOB_QUEUE_OBLITERATE,
				service: SERVICE_NAME,
				method: "obliterate",
				details: metrics,
			});
			return true;
		} catch (error) {
			error.service === undefined ? (error.service = SERVICE_NAME) : null;
			error.method === undefined ? (error.method = "obliterate") : null;
			throw error;
		}
	}
}

export default JobQueue;
