import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import multer from "multer";
const upload = multer();

class StatusPageRoutes {
	constructor(statusPageController) {
		this.router = Router();
		this.statusPageController = statusPageController;
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/", this.statusPageController.getStatusPage);
		this.router.post(
			"/",
			upload.single("logo"),
			verifyJWT,
			this.statusPageController.createStatusPage
		);
		this.router.delete("/", verifyJWT, this.statusPageController.deleteStatusPage);
	}

	getRouter() {
		return this.router;
	}
}

export default StatusPageRoutes;
