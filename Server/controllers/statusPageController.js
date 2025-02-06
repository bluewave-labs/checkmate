import { handleError, handleValidationError } from "./controllerUtils.js";
import {
	createStatusPageBodyValidation,
	getStatusPageParamValidation,
	imageValidation,
} from "../validation/joi.js";

const SERVICE_NAME = "statusPageController";

class StatusPageController {
	constructor(db, stringService) {
		this.db = db;
		this.stringService = stringService;
	}

	createStatusPage = async (req, res, next) => {
		try {
			await createStatusPageBodyValidation.validateAsync(req.body);
			await imageValidation.validateAsync(req.file);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			const statusPage = await this.db.createStatusPage(req.body, req.file);
			return res.success({
				msg: this.stringService.statusPageCreate,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "createStatusPage"));
		}
	};

	updateStatusPage = async (req, res, next) => {
		try {
			await createStatusPageBodyValidation.validateAsync(req.body);
			await imageValidation.validateAsync(req.file);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			const statusPage = await this.db.updateStatusPage(req.body, req.file);
			if (statusPage === null) {
				const error = new Error(this.stringService.statusPageNotFound);
				error.status = 404;
				throw error;
			}
			return res.success({
				msg: this.stringService.statusPageUpdate,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "updateStatusPage"));
		}
	};

	getStatusPage = async (req, res, next) => {
		try {
			const statusPage = await this.db.getStatusPage();
			return res.success({
				msg: this.stringService.statusPageByUrl,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getStatusPage"));
		}
	};

	deleteStatusPage = async (req, res, next) => {
		try {
			await this.db.deleteStatusPage();
			return res.success({
				msg: this.stringService.statusPageDelete,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "deleteStatusPage"));
		}
	};
}

export default StatusPageController;
