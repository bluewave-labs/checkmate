import {
	registrationBodyValidation,
	loginValidation,
	editUserParamValidation,
	editUserBodyValidation,
	recoveryValidation,
	recoveryTokenValidation,
	newPasswordValidation,
} from "../validation/joi.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { errorMessages, successMessages } from "../utils/messages.js";
import jwt from "jsonwebtoken";
import { getTokenFromHeaders, tokenType } from "../utils/utils.js";
import crypto from "crypto";
import { handleValidationError, handleError } from "./controllerUtils.js";
const SERVICE_NAME = "authController";
dotenv.config();

/**
 * Creates and returns JWT token with an arbitrary payload
 * @function
 * @param {Object} payload
 * @param {tokenType} typeOfToken - Whether to generate refresh token with long TTL or access token with short TTL.
 * @param {Object} appSettings
 * @returns {String}
 * @throws {Error}
 */
const issueToken = (payload, typeOfToken, appSettings) => {
	try {
		const tokenTTL =
			typeOfToken === tokenType.REFRESH_TOKEN
				? (appSettings?.refreshTokenTTL ?? "7d")
				: (appSettings?.jwtTTL ?? "2h");
		const tokenSecret =
			typeOfToken === tokenType.REFRESH_TOKEN
				? appSettings?.refreshTokenSecret
				: appSettings?.jwtSecret;
		const payloadData = typeOfToken === tokenType.REFRESH_TOKEN ? {} : payload;

		return jwt.sign(payloadData, tokenSecret, { expiresIn: tokenTTL });
	} catch (error) {
		throw handleError(error, SERVICE_NAME, "issueToken");
	}
};

/**
 * Registers a new user. If the user is the first account, a JWT secret is created. If not, an invite token is required.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.inviteToken - The invite token for registration.
 * @property {Object} req.file - The file object for the user's profile image.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the creation of the user, the created user data, and a JWT token.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422).
 */
const registerUser = async (req, res, next) => {
	// joi validation
	try {
		await registrationBodyValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}
	// Create a new user
	try {
		const { inviteToken } = req.body;
		// If superAdmin exists, a token should be attached to all further register requests
		const superAdminExists = await req.db.checkSuperadmin(req, res);
		if (superAdminExists) {
			await req.db.getInviteTokenAndDelete(inviteToken);
		} else {
			// This is the first account, create JWT secret to use if one is not supplied by env
			const jwtSecret = crypto.randomBytes(64).toString("hex");
			await req.db.updateAppSettings({ jwtSecret });
		}

		const newUser = await req.db.insertUser({ ...req.body }, req.file);
		logger.info({
			message: successMessages.AUTH_CREATE_USER,
			service: SERVICE_NAME,
			details: newUser._id,
		});

		const userForToken = { ...newUser._doc };
		delete userForToken.profileImage;
		delete userForToken.avatarImage;

		const appSettings = await req.settingsService.getSettings();

		const token = issueToken(userForToken, tokenType.ACCESS_TOKEN, appSettings);
		const refreshToken = issueToken({}, tokenType.REFRESH_TOKEN, appSettings);

		req.emailService
			.buildAndSendEmail(
				"welcomeEmailTemplate",
				{ name: newUser.firstName },
				newUser.email,
				"Welcome to Uptime Monitor"
			)
			.catch((error) => {
				logger.error({
					message: error.message,
					service: SERVICE_NAME,
					method: "registerUser",
					stack: error.stack,
				});
			});

		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_CREATE_USER,
			data: { user: newUser, token: token, refreshToken: refreshToken },
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "registerController"));
	}
};

/**
 * Logs in a user by validating the user's credentials and issuing a JWT token.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.email - The email of the user.
 * @property {string} req.body.password - The password of the user.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the login of the user, the user data (without password and avatar image), and a JWT token.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422) or the password is incorrect.
 */
const loginUser = async (req, res, next) => {
	try {
		await loginValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}
	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await req.db.getUserByEmail(email);

		// Compare password
		const match = await user.comparePassword(password);
		if (match !== true) {
			next(new Error(errorMessages.AUTH_INCORRECT_PASSWORD));
			return;
		}

		// Remove password from user object.  Should this be abstracted to DB layer?
		const userWithoutPassword = { ...user._doc };
		delete userWithoutPassword.password;
		delete userWithoutPassword.avatarImage;

		// Happy path, return token
		const appSettings = await req.settingsService.getSettings();
		const token = issueToken(userWithoutPassword, tokenType.ACCESS_TOKEN, appSettings);
		const refreshToken = issueToken({}, tokenType.REFRESH_TOKEN, appSettings);
		// reset avatar image
		userWithoutPassword.avatarImage = user.avatarImage;

		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_LOGIN_USER,
			data: { user: userWithoutPassword, token: token, refreshToken: refreshToken },
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "loginUser"));
	}
};

/**
 * Generates new auth token if the refresh token is valid
 * @async
 * @param {Express.Request} req - The Express request object.
 * @property {Object} req.headers - The parameter of the request.
 * @param {Express.Response} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating new auth token is generated.
 * @throws {Error} If there is an error during the process such as any of the token is not received
 */
const refreshAuthToken = async (req, res, next) => {
	try {
		// check for refreshToken
		const refreshToken = req.headers["x-refresh-token"];

		if (!refreshToken) {
			// No refresh token provided
			const error = new Error(errorMessages.NO_REFRESH_TOKEN);
			error.status = 401;
			error.service = SERVICE_NAME;
			error.method = "refreshAuthToken";
			return next(error);
		}

		// Verify refresh token
		const appSettings = await req.settingsService.getSettings();
		const { refreshTokenSecret } = appSettings;
		jwt.verify(refreshToken, refreshTokenSecret, async (refreshErr, refreshDecoded) => {
			if (refreshErr) {
				// Invalid or expired refresh token, trigger logout
				const errorMessage =
					refreshErr.name === "TokenExpiredError"
						? errorMessages.EXPIRED_REFRESH_TOKEN
						: errorMessages.INVALID_REFRESH_TOKEN;
				const error = new Error(errorMessage);
				error.status = 401;
				error.service = SERVICE_NAME;
				return next(error);
			}
		});
		// Refresh token is valid and unexpired, generate new access token
		const oldAuthToken = getTokenFromHeaders(req.headers);
		const { jwtSecret } = await req.settingsService.getSettings();
		const payloadData = jwt.verify(oldAuthToken, jwtSecret, { ignoreExpiration: true });
		// delete old token related data
		delete payloadData.iat;
		delete payloadData.exp;
		const newAuthToken = issueToken(payloadData, tokenType.ACCESS_TOKEN, appSettings);

		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_TOKEN_REFRESHED,
			data: { user: payloadData, token: newAuthToken, refreshToken: refreshToken },
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "refreshAuthToken"));
	}
};

/**
 * Edits a user's information. If the user wants to change their password, the current password is checked before updating to the new password.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.params - The parameters of the request.
 * @property {string} req.params.userId - The ID of the user to be edited.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.password - The current password of the user.
 * @property {string} req.body.newPassword - The new password of the user.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the update of the user, and the updated user data.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422), the user is unauthorized (401), or the password is incorrect (403).
 */
const editUser = async (req, res, next) => {
	try {
		await editUserParamValidation.validateAsync(req.params);
		await editUserBodyValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}

	// TODO is this neccessary any longer? Verify ownership middleware should handle this
	if (req.params.userId !== req.user._id.toString()) {
		const error = new Error(errorMessages.AUTH_UNAUTHORIZED);
		error.status = 401;
		error.service = SERVICE_NAME;
		next(error);
		return;
	}

	try {
		// Change Password check
		if (req.body.password && req.body.newPassword) {
			// Get token from headers
			const token = getTokenFromHeaders(req.headers);
			// Get email from token
			const { jwtSecret } = req.settingsService.getSettings();
			const { email } = jwt.verify(token, jwtSecret);
			// Add user email to body for DB operation
			req.body.email = email;
			// Get user
			const user = await req.db.getUserByEmail(email);
			// Compare passwords
			const match = await user.comparePassword(req.body.password);
			// If not a match, throw a 403
			// 403 instead of 401 to avoid triggering axios interceptor
			if (!match) {
				const error = new Error(errorMessages.AUTH_INCORRECT_PASSWORD);
				error.status = 403;
				next(error);
				return;
			}
			// If a match, update the password
			req.body.password = req.body.newPassword;
		}

		const updatedUser = await req.db.updateUser(req, res);
		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_UPDATE_USER,
			data: updatedUser,
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "userEditController"));
	}
};

/**
 * Checks if a superadmin account exists in the database.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the existence of a superadmin, and a boolean indicating the existence of a superadmin.
 * @throws {Error} If there is an error during the process.
 */
const checkSuperadminExists = async (req, res, next) => {
	try {
		const superAdminExists = await req.db.checkSuperadmin(req, res);
		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_ADMIN_EXISTS,
			data: superAdminExists,
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "checkSuperadminController"));
	}
};

/**
 * Requests a recovery token for a user. The user's email is validated and a recovery token is created and sent via email.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.email - The email of the user requesting recovery.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the creation of the recovery token, and the message ID of the sent email.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422).
 */
const requestRecovery = async (req, res, next) => {
	try {
		await recoveryValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}

	try {
		const { email } = req.body;
		const user = await req.db.getUserByEmail(email);
		const recoveryToken = await req.db.requestRecoveryToken(req, res);
		const name = user.firstName;
		const { clientHost } = req.settingsService.getSettings();
		const url = `${clientHost}/set-new-password/${recoveryToken.token}`;
		const msgId = await req.emailService.buildAndSendEmail(
			"passwordResetTemplate",
			{
				name,
				email,
				url,
			},
			email,
			"Checkmate Password Reset"
		);

		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_CREATE_RECOVERY_TOKEN,
			data: msgId,
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "recoveryRequestController"));
	}
};

/**
 * Validates a recovery token. The recovery token is validated and if valid, a success message is returned.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.token - The recovery token to be validated.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status and a message indicating the validation of the recovery token.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422).
 */
const validateRecovery = async (req, res, next) => {
	try {
		await recoveryTokenValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}

	try {
		await req.db.validateRecoveryToken(req, res);
		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_VERIFY_RECOVERY_TOKEN,
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "validateRecoveryTokenController"));
	}
};

/**
 * Resets a user's password. The new password is validated and if valid, the user's password is updated in the database and a new JWT token is issued.
 * @async
 * @param {Object} req - The Express request object.
 * @property {Object} req.body - The body of the request.
 * @property {string} req.body.token - The recovery token.
 * @property {string} req.body.password - The new password of the user.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The response object with a success status, a message indicating the reset of the password, the updated user data (without password and avatar image), and a new JWT token.
 * @throws {Error} If there is an error during the process, especially if there is a validation error (422).
 */
const resetPassword = async (req, res, next) => {
	try {
		await newPasswordValidation.validateAsync(req.body);
	} catch (error) {
		const validationError = handleValidationError(error, SERVICE_NAME);
		next(validationError);
		return;
	}
	try {
		const user = await req.db.resetPassword(req, res);
		const appSettings = await req.settingsService.getSettings();
		const token = issueToken(user._doc, tokenType.ACCESS_TOKEN, appSettings);
		res.status(200).json({
			success: true,
			msg: successMessages.AUTH_RESET_PASSWORD,
			data: { user, token },
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "resetPasswordController"));
	}
};

/**
 * Deletes a user and all associated monitors, checks, and alerts.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} The response object with success status and message.
 * @throws {Error} If user validation fails or user is not found in the database.
 */
const deleteUser = async (req, res, next) => {
	try {
		const token = getTokenFromHeaders(req.headers);
		const decodedToken = jwt.decode(token);
		const { email } = decodedToken;

		// Check if the user exists
		const user = await req.db.getUserByEmail(email);
		// 1. Find all the monitors associated with the team ID if superadmin

		const result = await req.db.getMonitorsByTeamId({
			params: { teamId: user.teamId },
		});

		if (user.role.includes("superadmin")) {
			//2.  Remove all jobs, delete checks and alerts
			result?.monitors.length > 0 &&
				(await Promise.all(
					result.monitors.map(async (monitor) => {
						await req.jobQueue.deleteJob(monitor);
						await req.db.deleteChecks(monitor._id);
						await req.db.deletePageSpeedChecksByMonitorId(monitor._id);
						await req.db.deleteNotificationsByMonitorId(monitor._id);
					})
				));

			// 3. Delete team
			await req.db.deleteTeam(user.teamId);
			// 4. Delete all other team members
			await req.db.deleteAllOtherUsers();
			// 5. Delete each monitor
			await req.db.deleteMonitorsByUserId(user._id);
		}
		// 6. Delete the user by id
		await req.db.deleteUser(user._id);
		return res.status(200).json({
			success: true,
			msg: successMessages.AUTH_DELETE_USER,
		});
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "deleteUserController"));
	}
};

const getAllUsers = async (req, res, next) => {
	try {
		const allUsers = await req.db.getAllUsers(req, res);
		res.status(200).json({ success: true, msg: "Got all users", data: allUsers });
	} catch (error) {
		next(handleError(error, SERVICE_NAME, "getAllUsersController"));
	}
};

export {
	issueToken,
	registerUser,
	loginUser,
	refreshAuthToken,
	editUser,
	checkSuperadminExists,
	requestRecovery,
	validateRecovery,
	resetPassword,
	deleteUser,
	getAllUsers,
};
