import {
	createMaintenanceWindowBodyValidation,
	editMaintenanceWindowByIdParamValidation,
	editMaintenanceByIdWindowBodyValidation,
	getMaintenanceWindowByIdParamValidation,
	getMaintenanceWindowsByMonitorIdParamValidation,
	getMaintenanceWindowsByTeamIdQueryValidation,
	deleteMaintenanceWindowByIdParamValidation,
} from "../validation/joi.js";
import jwt from "jsonwebtoken";
import { getTokenFromHeaders } from "../utils/utils.js";
import { successMessages } from "../utils/messages.js";
import { handleValidationError, handleError } from "./controllerUtils.js";
const SERVICE_NAME = "maintenanceWindowController";

class MaintenanceWindowController {
	constructor(db, settingsService) {
		this.db = db;
		this.settingsService = settingsService;
	}

	createMaintenanceWindows = async (req, res, next) => {
		try {
			await createMaintenanceWindowBodyValidation.validateAsync(req.body);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}
		try {
			const token = getTokenFromHeaders(req.headers);
			const { jwtSecret } = this.settingsService.getSettings();
			const { teamId } = jwt.verify(token, jwtSecret);
			const monitorIds = req.body.monitors;
			const dbTransactions = monitorIds.map((monitorId) => {
				return this.db.createMaintenanceWindow({
					teamId,
					monitorId,
					name: req.body.name,
					active: req.body.active ? req.body.active : true,
					repeat: req.body.repeat,
					start: req.body.start,
					end: req.body.end,
				});
			});
			await Promise.all(dbTransactions);
			return res.status(201).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_CREATE,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "createMaintenanceWindow"));
		}
	};

	getMaintenanceWindowById = async (req, res, next) => {
		try {
			await getMaintenanceWindowByIdParamValidation.validateAsync(req.params);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}
		try {
			const maintenanceWindow = await this.db.getMaintenanceWindowById(req.params.id);
			return res.status(200).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_GET_BY_ID,
				data: maintenanceWindow,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getMaintenanceWindowById"));
		}
	};

	getMaintenanceWindowsByTeamId = async (req, res, next) => {
		try {
			await getMaintenanceWindowsByTeamIdQueryValidation.validateAsync(req.query);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			const token = getTokenFromHeaders(req.headers);
			const { jwtSecret } = this.settingsService.getSettings();
			const { teamId } = jwt.verify(token, jwtSecret);
			const maintenanceWindows = await this.db.getMaintenanceWindowsByTeamId(
				teamId,
				req.query
			);

			return res.status(200).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_GET_BY_TEAM,
				data: maintenanceWindows,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getMaintenanceWindowsByUserId"));
		}
	};

	getMaintenanceWindowsByMonitorId = async (req, res, next) => {
		try {
			await getMaintenanceWindowsByMonitorIdParamValidation.validateAsync(req.params);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			const maintenanceWindows = await this.db.getMaintenanceWindowsByMonitorId(
				req.params.monitorId
			);

			return res.status(200).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_GET_BY_USER,
				data: maintenanceWindows,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getMaintenanceWindowsByMonitorId"));
		}
	};

	deleteMaintenanceWindow = async (req, res, next) => {
		try {
			await deleteMaintenanceWindowByIdParamValidation.validateAsync(req.params);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}
		try {
			await this.db.deleteMaintenanceWindowById(req.params.id);
			return res.status(200).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_DELETE,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "deleteMaintenanceWindow"));
		}
	};

	editMaintenanceWindow = async (req, res, next) => {
		try {
			await editMaintenanceWindowByIdParamValidation.validateAsync(req.params);
			await editMaintenanceByIdWindowBodyValidation.validateAsync(req.body);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}
		try {
			const editedMaintenanceWindow = await this.db.editMaintenanceWindowById(
				req.params.id,
				req.body
			);
			return res.status(200).json({
				success: true,
				msg: successMessages.MAINTENANCE_WINDOW_EDIT,
				data: editedMaintenanceWindow,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "editMaintenanceWindow"));
		}
	};
}

export default MaintenanceWindowController;
