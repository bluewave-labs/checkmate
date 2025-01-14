import { handleError } from "./controllerUtils.js";
import { successMessages } from "../utils/messages.js";

const SERVICE_NAME = "DistributedUptimeQueueController";

class DistributedUptimeController {
	constructor(http, statusService) {
		this.http = http;
		this.statusService = statusService;
		this.resultsCallback = this.resultsCallback.bind(this);
	}

	async resultsCallback(req, res, next) {
		try {
			const { id, result } = req.body;

			// Calculate response time
			const {
				first_byte_took,
				body_read_took,
				dns_took,
				conn_took,
				connect_took,
				tls_took,
				status_code,
				error,
			} = result;

			// Calculate response time
			const responseTime =
				(first_byte_took +
					body_read_took +
					dns_took +
					conn_took +
					connect_took +
					tls_took) /
				1_000_000;

			// Calculate if server is up or down
			const isErrorStatus = status_code >= 400;
			const hasError = error !== "";

			const status = isErrorStatus || hasError ? false : true;

			// Build response
			const distributedUptimeResponse = {
				monitorId: id,
				type: "distributed_http",
				payload: result,
				status,
				code: status_code,
				responseTime,
			};

			if (error) {
				const code = status_code || this.NETWORK_ERROR;
				distributedUptimeResponse.code = code;
				distributedUptimeResponse.message =
					this.http.STATUS_CODES[code] || "Network Error";
			} else {
				distributedUptimeResponse.message = this.http.STATUS_CODES[status_code];
			}

			await this.statusService.updateStatus(distributedUptimeResponse);

			res.status(200).json({ message: "OK" });
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "resultsCallback"));
		}
	}
}
export default DistributedUptimeController;
