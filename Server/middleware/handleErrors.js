import logger from "../utils/logger.js";
import { errorMessages } from "../utils/messages.js";

const handleErrors = (error, req, res, next) => {
	const status = error.status || 500;
	const message = error.message || errorMessages.FRIENDLY_ERROR;
	const service = error.service || errorMessages.UNKNOWN_SERVICE;
	logger.error({
		message: message,
		service: service,
		method: error.method,
		stack: error.stack,
	});
	res.error({
		status,
		msg: message,
	});
};

export { handleErrors };
