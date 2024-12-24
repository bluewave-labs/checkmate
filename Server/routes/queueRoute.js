import { Router } from "express";

class QueueRoutes {
	constructor(queueController) {
		this.router = Router();
		this.queueController = queueController;
		this.initRoutes();
	}
	initRoutes() {
		this.router.get("/metrics", this.queueController.getMetrics);
		this.router.get("/jobs", this.queueController.getJobs);
		this.router.post("/jobs", this.queueController.addJob);
		this.router.post("/obliterate", this.queueController.obliterateQueue);
	}

	getRouter() {
		return this.router;
	}
}

export default QueueRoutes;
