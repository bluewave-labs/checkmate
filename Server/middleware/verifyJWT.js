import jwt from "jsonwebtoken";
import { errorMessages } from "../utils/messages.js";
import ServiceRegistry from "../service/serviceRegistry.js";
import SettingsService from "../service/settingsService.js";
const SERVICE_NAME = "verifyJWT";
const TOKEN_PREFIX = "Bearer ";

/**
 * Verifies the JWT token
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {express.Response}
 */
const verifyJWT = (req, res, next) => {
	const token = req.headers["authorization"];
	// Make sure a token is provided
	if (!token) {
		const error = new Error(errorMessages.NO_AUTH_TOKEN);
		error.status = 401;
		error.service = SERVICE_NAME;
		next(error);
		return;
	}
	// Make sure it is properly formatted
	if (!token.startsWith(TOKEN_PREFIX)) {
		const error = new Error(errorMessages.INVALID_AUTH_TOKEN); // Instantiate a new Error object for improperly formatted token
		error.status = 400;
		error.service = SERVICE_NAME;
		error.method = "verifyJWT";
		next(error);
		return;
	}

	const parsedToken = token.slice(TOKEN_PREFIX.length, token.length);
	// Verify the token's authenticity
	const { jwtSecret } = ServiceRegistry.get(SettingsService.SERVICE_NAME).getSettings();
	jwt.verify(parsedToken, jwtSecret, (err, decoded) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				// token has expired
				handleExpiredJwtToken(req, res, next);
			} else {
				// Invalid token (signature or token altered or other issue)
				const errorMessage = errorMessages.INVALID_AUTH_TOKEN;
				return res.status(401).json({ success: false, msg: errorMessage });
			}
		} else {
			// Token is valid and not expired, carry on with request, Add the decoded payload to the request
			req.user = decoded;
			next();
		}
	});
};

function handleExpiredJwtToken(req, res, next) {
	// check for refreshToken
	const refreshToken = req.headers["x-refresh-token"];

	if (!refreshToken) {
		// No refresh token provided
		const error = new Error(errorMessages.NO_REFRESH_TOKEN);
		error.status = 401;
		error.service = SERVICE_NAME;
		error.method = "handleExpiredJwtToken";
		return next(error);
	}

	// Verify refresh token
	const { refreshTokenSecret } = ServiceRegistry.get(
		SettingsService.SERVICE_NAME
	).getSettings();
	jwt.verify(refreshToken, refreshTokenSecret, (refreshErr, refreshDecoded) => {
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

		// Refresh token is valid and unexpired, request for new access token
		res.status(403).json({
			success: false,
			msg: errorMessages.REQUEST_NEW_ACCESS_TOKEN,
		});
	});
}

export { verifyJWT };
