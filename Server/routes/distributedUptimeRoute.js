import { Router } from "express";

class DistributedUptimeRoutes {
	constructor(distributedUptimeController) {
		this.router = Router();
		this.distributedUptimeController = distributedUptimeController;
		this.initRoutes();
	}
	initRoutes() {
		this.router.post("/callback", this.distributedUptimeController.resultsCallback);
		this.router.get(
			"/monitors/:teamId",
			this.distributedUptimeController.getDistributedUptimeMonitors
		);
		this.router.get(
			"/monitors/details/:monitorId",
			this.distributedUptimeController.getDistributedUptimeMonitorDetails
		);
	}

	getRouter() {
		return this.router;
	}
}

export default DistributedUptimeRoutes;
