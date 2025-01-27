import { handleError } from "./controllerUtils.js";
import { successMessages } from "../utils/messages.js";

const SERVICE_NAME = "JobQueueController";

class JobQueueController {
	constructor(jobQueue) {
		this.jobQueue = jobQueue;
	}

	getMetrics = async (req, res, next) => {
		try {
			const metrics = await this.jobQueue.getMetrics();
			res.success({
				msg: successMessages.QUEUE_GET_METRICS(req.language),
				data: metrics,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getMetrics"));
			return;
		}
	};

	getJobs = async (req, res, next) => {
		try {
			const jobs = await this.jobQueue.getJobStats();
			return res.success({
				msg: successMessages.QUEUE_GET_METRICS(req.language),
				data: jobs,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getJobs"));
			return;
		}
	};

	addJob = async (req, res, next) => {
		try {
			await this.jobQueue.addJob(Math.random().toString(36).substring(7));
			return res.success({
				msg: successMessages.QUEUE_ADD_JOB(req.language),
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "addJob"));
			return;
		}
	};

	obliterateQueue = async (req, res, next) => {
		try {
			await this.jobQueue.obliterate();
			return res.success({
				msg: successMessages.QUEUE_OBLITERATE(req.language),
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "obliterateQueue"));
			return;
		}
	};
}
export default JobQueueController;
