import { successMessages } from "../utils/messages.js";
import { updateAppSettingsBodyValidation } from "../validation/joi.js";
import { handleValidationError, handleError } from "./controllerUtils.js";
const SERVICE_NAME = "SettingsController";

class SettingsController {
	constructor(db, settingsService) {
		this.db = db;
		this.settingsService = settingsService;
	}

	getAppSettings = async (req, res, next) => {
		try {
			const settings = { ...(await this.settingsService.getSettings()) };
			delete settings.jwtSecret;
			return res.status(200).json({
				success: true,
				msg: successMessages.GET_APP_SETTINGS,
				data: settings,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "getAppSettings"));
		}
	};

	updateAppSettings = async (req, res, next) => {
		try {
			await updateAppSettingsBodyValidation.validateAsync(req.body);
		} catch (error) {
			next(handleValidationError(error, SERVICE_NAME));
			return;
		}

		try {
			await this.db.updateAppSettings(req.body);
			const updatedSettings = { ...(await this.settingsService.reloadSettings()) };
			delete updatedSettings.jwtSecret;
			return res.status(200).json({
				success: true,
				msg: successMessages.UPDATE_APP_SETTINGS,
				data: updatedSettings,
			});
		} catch (error) {
			next(handleError(error, SERVICE_NAME, "updateAppSettings"));
		}
	};
}

export default SettingsController;
