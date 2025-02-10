import { handleError, handleValidationError } from "./controllerUtils.js";
import {
	createStatusPageBodyValidation,
	getStatusPageParamValidation,
	getStatusPageQueryValidation,
	imageValidation,
} from "../validation/joi.js";
import { successMessages, errorMessages } from "../utils/messages.js";

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
				const error = new Error(errorMessages.STATUS_PAGE_NOT_FOUND);
				error.status = 404;
				throw error;
			}
			return res.success({
				msg: successMessages.STATUS_PAGE_UPDATE,
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
				msg: successMessages.STATUS_PAGE,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getStatusPage"));
		}
	};

	getStatusPageByUrl = async (req, res, next) => {
		try {
			await getStatusPageParamValidation.validateAsync(req.params);
			await getStatusPageQueryValidation.validateAsync(req.query);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			const statusPage = await this.db.getStatusPageByUrl(req.params.url, req.query.type);
			return res.success({
				msg: successMessages.STATUS_PAGE_BY_URL,
				data: statusPage,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getStatusPageByUrl"));
		}
	};

	getStatusPagesByTeamId = async (req, res, next) => {
		try {
			const teamId = req.params.teamId;
			const statusPages = await this.db.getStatusPagesByTeamId(teamId);
			return res.success({
				msg: successMessages.STATUS_PAGE_BY_TEAM_ID,
				data: statusPages,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getStatusPageByUrl"));
		}
	};

	deleteStatusPage = async (req, res, next) => {
		try {
			await this.db.deleteStatusPage(req.params.url);
			return res.success({
				msg: successMessages.STATUS_PAGE_DELETE,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "deleteStatusPage"));
		}
	};
}

export default StatusPageController;
