import StatusPage from "../../models/StatusPage.js";
import { errorMessages } from "../../../utils/messages.js";
import { NormalizeData } from "../../../utils/dataUtils.js";

const SERVICE_NAME = "statusPageModule";

const createStatusPage = async (statusPageData, image) => {
	try {
		const statusPage = new StatusPage({ ...statusPageData });
		if (image) {
			statusPage.logo = {
				data: image.buffer,
				contentType: image.mimetype,
			};
		}
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

const updateStatusPage = async (statusPageData, image) => {
	try {
		if (image) {
			statusPageData.logo = {
				data: image.buffer,
				contentType: image.mimetype,
			};
		}
		const statusPage = await StatusPage.findOneAndUpdate({}, statusPageData, {
			new: true,
		});

		return statusPage;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "updateStatusPage";
		throw error;
	}
};

const getStatusPage = async () => {
	try {
		const statusPageQuery = await StatusPage.aggregate([
			{ $limit: 1 },
			{
				$set: {
					originalMonitors: "$monitors",
				},
			},
			{
				$lookup: {
					from: "monitors",
					localField: "monitors",
					foreignField: "_id",
					as: "monitors",
				},
			},
			{
				$unwind: "$monitors",
			},
			{
				$lookup: {
					from: "checks",
					let: { monitorId: "$monitors._id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$monitorId", "$$monitorId"] },
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 25 },
					],
					as: "monitors.checks",
				},
			},
			{
				$addFields: {
					"monitors.orderIndex": {
						$indexOfArray: ["$originalMonitors", "$monitors._id"],
					},
				},
			},
			{
				$group: {
					_id: "$_id",
					statusPage: { $first: "$$ROOT" },
					monitors: { $push: "$monitors" },
				},
			},
			{
				$project: {
					statusPage: {
						_id: 1,
						color: 1,
						companyName: 1,
						isPublished: 1,
						logo: 1,
						originalMonitors: 1,
						showCharts: 1,
						showUptimePercentage: 1,
						timezone: 1,
						url: 1,
					},
					monitors: {
						$sortArray: {
							input: "$monitors",
							sortBy: { orderIndex: 1 },
						},
					},
				},
			},
		]);
		if (!statusPageQuery.length) {
			const error = new Error(errorMessages.STATUS_PAGE_NOT_FOUND);
			error.status = 404;
			throw error;
		}

		const { statusPage, monitors } = statusPageQuery[0];

		const normalizedMonitors = monitors.map((monitor) => {
			return {
				...monitor,
				checks: NormalizeData(monitor.checks, 10, 100),
			};
		});

		return { statusPage, monitors: normalizedMonitors };
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getStatusPageByUrl";
		throw error;
	}
};

const deleteStatusPage = async () => {
	try {
		await StatusPage.deleteOne({});
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "createStatusPage";
		throw error;
	}
};

export { createStatusPage, updateStatusPage, getStatusPage, deleteStatusPage };
