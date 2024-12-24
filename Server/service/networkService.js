import { errorMessages, successMessages } from "../utils/messages.js";
const SERVICE_NAME = "NetworkService";

/**
 * Constructs a new NetworkService instance.
 *
 * @param {Object} axios - The axios instance for HTTP requests.
 * @param {Object} ping - The ping utility for network checks.
 * @param {Object} logger - The logger instance for logging.
 * @param {Object} http - The HTTP utility for network operations.
 */
class NetworkService {
	static SERVICE_NAME = SERVICE_NAME;
	constructor(axios, ping, logger, http, Docker) {
		this.TYPE_PING = "ping";
		this.TYPE_HTTP = "http";
		this.TYPE_PAGESPEED = "pagespeed";
		this.TYPE_HARDWARE = "hardware";
		this.TYPE_DOCKER = "docker";
		this.SERVICE_NAME = SERVICE_NAME;
		this.NETWORK_ERROR = 5000;
		this.PING_ERROR = 5001;
		this.axios = axios;
		this.ping = ping;
		this.logger = logger;
		this.http = http;
		this.Docker = Docker;
	}

	/**
	 * Times the execution of an asynchronous operation.
	 *
	 * @param {Function} operation - The asynchronous operation to be timed.
	 * @returns {Promise<Object>} An object containing the response, response time, and optionally an error.
	 * @property {Object|null} response - The response from the operation, or null if an error occurred.
	 * @property {number} responseTime - The time taken for the operation to complete, in milliseconds.
	 * @property {Error} [error] - The error object if an error occurred during the operation.
	 */
	async timeRequest(operation) {
		const startTime = Date.now();
		try {
			const response = await operation();
			const endTime = Date.now();
			const responseTime = endTime - startTime;
			return { response, responseTime };
		} catch (error) {
			const endTime = Date.now();
			const responseTime = endTime - startTime;
			return { response: null, responseTime, error };
		}
	}

	/**
	 * Sends a ping request to the specified URL and returns the response.
	 *
	 * @param {Object} job - The job object containing the data for the ping request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.url - The URL to ping.
	 * @param {string} job.data._id - The monitor ID for the ping request.
	 * @returns {Promise<Object>} An object containing the ping response details.
	 * @property {string} monitorId - The monitor ID for the ping request.
	 * @property {string} type - The type of request, which is "ping".
	 * @property {number} responseTime - The time taken for the ping request to complete, in milliseconds.
	 * @property {Object} payload - The response payload from the ping request.
	 * @property {boolean} status - The status of the ping request (true if successful, false otherwise).
	 * @property {number} code - The response code (200 if successful, error code otherwise).
	 * @property {string} message - The message indicating the result of the ping request.
	 */
	async requestPing(job) {
		try {
			const url = job.data.url;
			const { response, responseTime, error } = await this.timeRequest(() =>
				this.ping.promise.probe(url)
			);

			const pingResponse = {
				monitorId: job.data._id,
				type: "ping",
				responseTime,
				payload: response,
			};
			if (error) {
				pingResponse.status = false;
				pingResponse.code = this.PING_ERROR;
				pingResponse.message = errorMessages.PING_CANNOT_RESOLVE;
				return pingResponse;
			}

			pingResponse.code = 200;
			pingResponse.status = response.alive;
			pingResponse.message = successMessages.PING_SUCCESS;
			return pingResponse;
		} catch (error) {
			error.service = this.SERVICE_NAME;
			error.method = "requestPing";
			throw error;
		}
	}

	/**
	 * Sends an HTTP GET request to the specified URL and returns the response.
	 *
	 * @param {Object} job - The job object containing the data for the HTTP request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.url - The URL to send the HTTP GET request to.
	 * @param {string} job.data._id - The monitor ID for the HTTP request.
	 * @param {string} [job.data.secret] - Secret for authorization if provided.
	 * @returns {Promise<Object>} An object containing the HTTP response details.
	 * @property {string} monitorId - The monitor ID for the HTTP request.
	 * @property {string} type - The type of request, which is "http".
	 * @property {number} responseTime - The time taken for the HTTP request to complete, in milliseconds.
	 * @property {Object} payload - The response payload from the HTTP request.
	 * @property {boolean} status - The status of the HTTP request (true if successful, false otherwise).
	 * @property {number} code - The response code (200 if successful, error code otherwise).
	 * @property {string} message - The message indicating the result of the HTTP request.
	 */
	async requestHttp(job) {
		try {
			const url = job.data.url;
			const config = {};

			job.data.secret !== undefined &&
				(config.headers = { Authorization: `Bearer ${job.data.secret}` });

			const { response, responseTime, error } = await this.timeRequest(() =>
				this.axios.get(url, config)
			);

			const httpResponse = {
				monitorId: job.data._id,
				type: job.data.type,
				responseTime,
				payload: response?.data,
			};

			if (error) {
				const code = error.response?.status || this.NETWORK_ERROR;
				httpResponse.code = code;
				httpResponse.status = false;
				httpResponse.message = this.http.STATUS_CODES[code] || "Network Error";
				return httpResponse;
			}
			httpResponse.status = true;
			httpResponse.code = response.status;
			httpResponse.message = this.http.STATUS_CODES[response.status];
			return httpResponse;
		} catch (error) {
			error.service = this.SERVICE_NAME;
			error.method = "requestHttp";
			throw error;
		}
	}

	/**
	 * Sends a request to the Google PageSpeed Insights API for the specified URL and returns the response.
	 *
	 * @param {Object} job - The job object containing the data for the PageSpeed request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.url - The URL to analyze with PageSpeed Insights.
	 * @param {string} job.data._id - The monitor ID for the PageSpeed request.
	 * @returns {Promise<Object>} An object containing the PageSpeed response details.
	 * @property {string} monitorId - The monitor ID for the PageSpeed request.
	 * @property {string} type - The type of request, which is "pagespeed".
	 * @property {number} responseTime - The time taken for the PageSpeed request to complete, in milliseconds.
	 * @property {Object} payload - The response payload from the PageSpeed request.
	 * @property {boolean} status - The status of the PageSpeed request (true if successful, false otherwise).
	 * @property {number} code - The response code (200 if successful, error code otherwise).
	 * @property {string} message - The message indicating the result of the PageSpeed request.
	 */
	async requestPagespeed(job) {
		try {
			const url = job.data.url;
			const updatedJob = { ...job };
			const pagespeedUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&category=seo&category=accessibility&category=best-practices&category=performance`;
			updatedJob.data.url = pagespeedUrl;
			return await this.requestHttp(updatedJob);
		} catch (error) {
			error.service = this.SERVICE_NAME;
			error.method = "requestPagespeed";
			throw error;
		}
	}

	/**
	 * Sends an HTTP request to check hardware status and returns the response.
	 *
	 * @param {Object} job - The job object containing the data for the hardware request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.url - The URL to send the hardware status request to.
	 * @param {string} job.data._id - The monitor ID for the hardware request.
	 * @param {string} job.data.type - The type of request, which is "hardware".
	 * @returns {Promise<Object>} An object containing the hardware status response details.
	 * @property {string} monitorId - The monitor ID for the hardware request.
	 * @property {string} type - The type of request ("hardware").
	 * @property {number} responseTime - The time taken for the request to complete, in milliseconds.
	 * @property {Object} payload - The response payload from the hardware status request.
	 * @property {boolean} status - The status of the request (true if successful, false otherwise).
	 * @property {number} code - The response code (200 if successful, error code otherwise).
	 * @property {string} message - The message indicating the result of the hardware status request.
	 */
	async requestHardware(job) {
		try {
			return await this.requestHttp(job);
		} catch (error) {
			error.service = this.SERVICE_NAME;
			error.method = "requestHardware";
			throw error;
		}
	}

	/**
	 * Sends a request to inspect a Docker container and returns its status.
	 *
	 * @param {Object} job - The job object containing the data for the Docker request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.url - The container ID or name to inspect.
	 * @param {string} job.data._id - The monitor ID for the Docker request.
	 * @param {string} job.data.type - The type of request, which is "docker".
	 * @returns {Promise<Object>} An object containing the Docker container status details.
	 * @property {string} monitorId - The monitor ID for the Docker request.
	 * @property {string} type - The type of request ("docker").
	 * @property {number} responseTime - The time taken for the Docker inspection to complete, in milliseconds.
	 * @property {boolean} status - The status of the container (true if running, false otherwise).
	 * @property {number} code - The response code (200 if successful, error code otherwise).
	 * @property {string} message - The message indicating the result of the Docker inspection.
	 */
	async requestDocker(job) {
		try {
			const docker = new this.Docker({
				socketPath: "/var/run/docker.sock",
				handleError: true, // Enable error handling
			});

			const containers = await docker.listContainers({ all: true });
			const containerExists = containers.some((c) => c.Id.startsWith(job.data.url));
			if (!containerExists) {
				throw new Error(errorMessages.DOCKER_NOT_FOUND);
			}
			const container = docker.getContainer(job.data.url);

			const { response, responseTime, error } = await this.timeRequest(() =>
				container.inspect()
			);

			const dockerResponse = {
				monitorId: job.data._id,
				type: job.data.type,
				responseTime,
			};

			if (error) {
				dockerResponse.status = false;
				dockerResponse.code = error.statusCode || this.NETWORK_ERROR;
				dockerResponse.message = error.reason || errorMessages.DOCKER_FAIL;
				return dockerResponse;
			}
			dockerResponse.status = response?.State?.Status === "running" ? true : false;
			dockerResponse.code = 200;
			dockerResponse.message = successMessages.DOCKER_SUCCESS;
			return dockerResponse;
		} catch (error) {
			error.service = this.SERVICE_NAME;
			error.method = "requestDocker";
			throw error;
		}
	}

	/**
	 * Handles unsupported job types by throwing an error with details.
	 *
	 * @param {string} type - The unsupported job type that was provided
	 * @throws {Error} An error with service name, method name and unsupported type message
	 */
	handleUnsupportedType(type) {
		const err = new Error(`Unsupported type: ${type}`);
		err.service = this.SERVICE_NAME;
		err.method = "getStatus";
		throw err;
	}

	/**
	 * Gets the status of a job based on its type and returns the appropriate response.
	 *
	 * @param {Object} job - The job object containing the data for the status request.
	 * @param {Object} job.data - The data object within the job.
	 * @param {string} job.data.type - The type of the job (e.g., "ping", "http", "pagespeed", "hardware").
	 * @returns {Promise<Object>} The response object from the appropriate request method.
	 * @throws {Error} Throws an error if the job type is unsupported.
	 */
	async getStatus(job) {
		const type = job?.data?.type ?? "unknown";
		switch (type) {
			case this.TYPE_PING:
				return await this.requestPing(job);
			case this.TYPE_HTTP:
				return await this.requestHttp(job);
			case this.TYPE_PAGESPEED:
				return await this.requestPagespeed(job);
			case this.TYPE_HARDWARE:
				return await this.requestHardware(job);
			case this.TYPE_DOCKER:
				return await this.requestDocker(job);
			default:
				return this.handleUnsupportedType(type);
		}
	}
}

export default NetworkService;
