import StatusPage from "../../models/StatusPage.js";
import { errorMessages } from "../../../utils/messages.js";

const SERVICE_NAME = "statusPageModule";

const createStatusPage = async (statusPageData) => {
	try {
		const statusPage = new StatusPage({ ...statusPageData });
		await statusPage.save();
		return statusPage;
	} catch (error) {
		if (error?.code === 11000) {
			// Handle duplicate URL errors
			error.status = 400;
			error.message = errorMessages.STATUS_PAGE_URL_NOT_UNIQUE;
		}
		error.service = SERVICE_NAME;
		error.method = "createStatusPage";
		throw error;
	}
};

const getStatusPageByUrl = async (url, language) => {
	try {
		const statusPage = await StatusPage.findOne({ url });
		if (statusPage === null || statusPage === undefined) {
			const error = new Error(errorMessages.STATUS_PAGE_NOT_FOUND(language));
			error.status = 404;

			throw error;
		}
		return statusPage;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getStatusPageByUrl";
		throw error;
	}
};

export { createStatusPage, getStatusPageByUrl };
