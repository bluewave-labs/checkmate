import { handleError } from "./controllerUtils.js";
import Monitor from "../db/models/Monitor.js";
import DistributedUptimeCheck from "../db/models/DistributedUptimeCheck.js";

const SERVICE_NAME = "DistributedUptimeQueueController";

class DistributedUptimeController {
	constructor(db, http, statusService) {
		this.db = db;
		this.http = http;
		this.statusService = statusService;
		this.resultsCallback = this.resultsCallback.bind(this);
		this.getDistributedUptimeMonitors = this.getDistributedUptimeMonitors.bind(this);
		this.getDistributedUptimeMonitorDetails =
			this.getDistributedUptimeMonitorDetails.bind(this);
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

	async getDistributedUptimeMonitors(req, res, next) {
		try {
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");
			res.setHeader("Access-Control-Allow-Origin", "*");

			const BATCH_DELAY = 1000;
			let batchTimeout = null;
			let opInProgress = false;

			// Do things here
			const notifyChange = async () => {
				if (opInProgress) {
					// Get data
					const monitors = await this.db.getMonitorsByTeamId(req);
					res.write(`data: ${JSON.stringify({ monitors })}\n\n`);
					opInProgress = false;
				}
				batchTimeout = null;
			};

			const handleChange = () => {
				opInProgress = true;
				if (batchTimeout) clearTimeout(batchTimeout);
				batchTimeout = setTimeout(notifyChange, BATCH_DELAY);
			};

			const monitorStream = Monitor.watch(
				[{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }],
				{ fullDocument: "updateLookup" }
			);

			const checksStream = DistributedUptimeCheck.watch(
				[{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }],
				{ fullDocument: "updateLookup" }
			);

			monitorStream.on("change", handleChange);
			checksStream.on("change", handleChange);

			// Send initial data
			const monitors = await this.db.getMonitorsByTeamId(req);
			res.write(`data: ${JSON.stringify({ monitors })}\n\n`);

			// Handle client disconnect
			req.on("close", () => {
				if (batchTimeout) {
					clearTimeout(batchTimeout);
				}
				monitorStream.close();
				checksStream.close();
				clearInterval(keepAlive);
			});

			// Keep connection alive
			const keepAlive = setInterval(() => {
				res.write(": keepalive\n\n");
			}, 30000);

			// Clean up on close
			req.on("close", () => {
				clearInterval(keepAlive);
			});
		} catch (error) {
			console.log(error);
			next(handleError(error, SERVICE_NAME, "getDistributedUptimeMonitors"));
		}
	}

	async getDistributedUptimeMonitorDetails(req, res, next) {
		try {
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");
			res.setHeader("Access-Control-Allow-Origin", "*");

			const BATCH_DELAY = 1000;
			let batchTimeout = null;
			let opInProgress = false;

			// Do things here
			const notifyChange = async () => {
				try {
					if (opInProgress) {
						// Get data
						const monitor = await this.db.getDistributedUptimeDetailsById(req);
						res.write(`data: ${JSON.stringify({ monitor })}\n\n`);
						opInProgress = false;
					}
					batchTimeout = null;
				} catch (error) {
					console.error("Error in notifyChange:", error);
					opInProgress = false;
					batchTimeout = null;
					next(handleError(error, SERVICE_NAME, "getDistributedUptimeMonitorDetails"));
				}
			};

			const handleChange = () => {
				opInProgress = true;
				if (batchTimeout) clearTimeout(batchTimeout);
				batchTimeout = setTimeout(notifyChange, BATCH_DELAY);
			};

			const checksStream = DistributedUptimeCheck.watch(
				[{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }],
				{ fullDocument: "updateLookup" }
			);

			checksStream.on("change", handleChange);

			// Send initial data
			const monitor = await this.db.getDistributedUptimeDetailsById(req);
			res.write(`data: ${JSON.stringify({ monitor })}\n\n`);

			// Handle client disconnect
			req.on("close", () => {
				if (batchTimeout) {
					clearTimeout(batchTimeout);
				}
				checksStream.close();
				clearInterval(keepAlive);
			});

			// Keep connection alive
			const keepAlive = setInterval(() => {
				res.write(": keepalive\n\n");
			}, 30000);

			// Clean up on close
			req.on("close", () => {
				clearInterval(keepAlive);
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getDistributedUptimeMonitorDetails"));
		}
	}
}
export default DistributedUptimeController;
