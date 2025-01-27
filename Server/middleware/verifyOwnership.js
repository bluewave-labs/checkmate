import logger from "../utils/logger.js";
import { errorMessages } from "../utils/messages.js";
const SERVICE_NAME = "verifyOwnership";

const verifyOwnership = (Model, paramName) => {
	return async (req, res, next) => {
		const userId = req.user._id;
		const documentId = req.params[paramName];
		try {
			const doc = await Model.findById(documentId);
			//If the document is not found, return a 404 error
			if (!doc) {
				logger.error({
					message: errorMessages.VERIFY_OWNER_NOT_FOUND,
					service: SERVICE_NAME,
					method: "verifyOwnership",
				});
				const error = new Error(errorMessages.VERIFY_OWNER_NOT_FOUND(req.language));
				error.status = 404;
				throw error;
			}

			// Special case for User model, as it will not have a `userId` field as other docs will
			if (Model.modelName === "User") {
				if (userId.toString() !== doc._id.toString()) {
					const error = new Error(errorMessages.VERIFY_OWNER_UNAUTHORIZED(req.language));
					error.status = 403;
					throw error;
				}
				next();
				return;
			}

			// If the userID does not match the document's userID, return a 403 error
			if (userId.toString() !== doc.userId.toString()) {
				const error = new Error(errorMessages.VERIFY_OWNER_UNAUTHORIZED(req.language));
				error.status = 403;
				throw error;
			}
			next();
			return;
		} catch (error) {
			error.service = SERVICE_NAME;
			error.method = "verifyOwnership";
			next(error);
			return;
		}
	};
};

export { verifyOwnership };
