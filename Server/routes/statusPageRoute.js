import { Router } from "express";

import { verifyJWT } from "../middleware/verifyJWT.js";

class StatusPageRoutes {
	constructor(statusPageController) {
		this.router = Router();
		this.statusPageController = statusPageController;
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/:url", this.statusPageController.getStatusPageByUrl);
		this.router.post("/:url", verifyJWT, this.statusPageController.createStatusPage);
	}

	getRouter() {
		return this.router;
	}
}

export default StatusPageRoutes;
