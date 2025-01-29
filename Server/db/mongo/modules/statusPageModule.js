import StatusPage from "../../models/StatusPage.js";
import ServiceRegistry from "../../../service/serviceRegistry.js";
import StringService from "../../../service/stringService.js";

const SERVICE_NAME = "statusPageModule";

const createStatusPage = async (statusPageData) => {
	const stringService = ServiceRegistry.get(StringService.SERVICE_NAME);
	try {
		const statusPage = new StatusPage({ ...statusPageData });
		await statusPage.save();
		return statusPage;
	} catch (error) {
		if (error?.code === 11000) {
			// Handle duplicate URL errors
			error.status = 400;
			error.message = stringService.statusPageUrlNotUnique;
		}
		error.service = SERVICE_NAME;
		error.method = "createStatusPage";
		throw error;
	}
};

const getStatusPageByUrl = async (url) => {
	const stringService = ServiceRegistry.get(StringService.SERVICE_NAME);
	try {
		const statusPage = await StatusPage.findOne({ url });
		if (statusPage === null || statusPage === undefined) {
			const error = new Error(stringService.statusPageNotFound);
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
