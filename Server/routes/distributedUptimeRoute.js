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
	}

	getRouter() {
		return this.router;
	}
}

export default DistributedUptimeRoutes;
