import { handleError, handleValidationError } from "./controllerUtils.js";
import {
	createStatusPageBodyValidation,
	getStatusPageParamValidation,
	imageValidation,
} from "../validation/joi.js";
import { successMessages } from "../utils/messages.js";

const SERVICE_NAME = "statusPageController";

class StatusPageController {
	constructor(db) {
		this.db = db;
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
				msg: successMessages.STATUS_PAGE_CREATE,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "createStatusPage"));
		}
	};
	getStatusPage = async (req, res, next) => {
		try {
			const statusPage = await this.db.getStatusPage();
			return res.success({
				msg: successMessages.STATUS_PAGE_BY_URL,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getStatusPage"));
		}
	};
}

export default StatusPageController;
