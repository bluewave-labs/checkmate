import { handleError } from "./controllerUtils.js";
import { successMessages } from "../utils/messages.js";

const SERVICE_NAME = "DistributedUptimeQueueController";

class DistributedUptimeController {
	constructor() {}

	async resultsCallback(req, res, next) {
		try {
			res.status(200).json({ message: "OK" });
		} catch (error) {
			throw handleError(error, SERVICE_NAME, "resultsCallback");
		}
	}
}
export default DistributedUptimeController;
