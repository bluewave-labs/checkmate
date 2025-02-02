import Check from "../../models/Check.js";
import Monitor from "../../models/Monitor.js";
import User from "../../models/User.js";
import logger from "../../../utils/logger.js";
import { ObjectId } from "mongodb";

const SERVICE_NAME = "checkModule";
const dateRangeLookup = {
	hour: new Date(new Date().setHours(new Date().getHours() - 1)),
	day: new Date(new Date().setDate(new Date().getDate() - 1)),
	week: new Date(new Date().setDate(new Date().getDate() - 7)),
	month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
	all: undefined,
};

/**
 * Create a check for a monitor
 * @async
 * @param {Object} checkData
 * @param {string} checkData.monitorId
 * @param {boolean} checkData.status
 * @param {number} checkData.responseTime
 * @param {number} checkData.statusCode
 * @param {string} checkData.message
 * @returns {Promise<Check>}
 * @throws {Error}
 */

const createCheck = async (checkData) => {
	try {
		const { monitorId, status } = checkData;
		const n = (await Check.countDocuments({ monitorId })) + 1;
		const check = await new Check({ ...checkData }).save();
		const monitor = await Monitor.findById(monitorId);

		if (!monitor) {
			logger.error({
				message: "Monitor not found",
				service: SERVICE_NAME,
				method: "createCheck",
				details: `monitor ID: ${monitorId}`,
			});
			return;
		}

		// Update uptime percentage
		if (monitor.uptimePercentage === undefined) {
			monitor.uptimePercentage = status === true ? 1 : 0;
		} else {
			monitor.uptimePercentage =
				(monitor.uptimePercentage * (n - 1) + (status === true ? 1 : 0)) / n;
		}

		await monitor.save();
		return check;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "createCheck";
		throw error;
	}
};

/**
 * Get all checks for a monitor
 * @async
 * @param {string} monitorId
 * @returns {Promise<Array<Check>>}
 * @throws {Error}
 */
const getChecksByMonitor = async (req) => {
	try {
		const { monitorId } = req.params;
		let { sortOrder, dateRange, filter, page, rowsPerPage, status } = req.query;
		status = typeof status !== "undefined" ? false : undefined;
		page = parseInt(page);
		rowsPerPage = parseInt(rowsPerPage);
		// Match
		const matchStage = {
			monitorId: ObjectId.createFromHexString(monitorId),
			...(typeof status !== "undefined" && { status }),
			...(dateRangeLookup[dateRange] && {
				createdAt: {
					$gte: dateRangeLookup[dateRange],
				},
			}),
		};

		if (filter !== undefined) {
			switch (filter) {
				case "all":
					break;
				case "down":
					break;
				case "resolve":
					matchStage.statusCode = 5000;
					break;
				default:
					logger.warn({
						message: "invalid filter",
						service: SERVICE_NAME,
						method: "getChecks",
					});
					break;
			}
		}

		//Sort
		sortOrder = sortOrder === "asc" ? 1 : -1;

		// Pagination
		let skip = 0;
		if (page && rowsPerPage) {
			skip = page * rowsPerPage;
		}
		const checks = await Check.aggregate([
			{ $match: matchStage },
			{ $sort: { createdAt: sortOrder } },
			{
				$facet: {
					summary: [{ $count: "checksCount" }],
					checks: [{ $skip: skip }, { $limit: rowsPerPage }],
				},
			},
			{
				$project: {
					checksCount: {
						$ifNull: [{ $arrayElemAt: ["$summary.checksCount", 0] }, 0],
					},
					checks: {
						$ifNull: ["$checks", []],
					},
				},
			},
		]);

		return checks[0];
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getChecks";
		throw error;
	}
};

const getChecksByTeam = async (req) => {
	try {
		let { sortOrder, dateRange, filter, page, rowsPerPage } = req.query;
		page = parseInt(page);
		rowsPerPage = parseInt(rowsPerPage);
		const { teamId } = req.params;
		const matchStage = {
			teamId: ObjectId.createFromHexString(teamId),
			status: false,
			...(dateRangeLookup[dateRange] && {
				createdAt: {
					$gte: dateRangeLookup[dateRange],
				},
			}),
		};
		// Add filter to match stage
		if (filter !== undefined) {
			switch (filter) {
				case "all":
					break;
				case "down":
					break;
				case "resolve":
					matchStage.statusCode = 5000;
					break;
				default:
					logger.warn({
						message: "invalid filter",
						service: SERVICE_NAME,
						method: "getChecksByTeam",
					});
					break;
			}
		}

		sortOrder = sortOrder === "asc" ? 1 : -1;

		// pagination
		let skip = 0;
		if (page && rowsPerPage) {
			skip = page * rowsPerPage;
		}

		const checks = await Check.aggregate([
			{ $match: matchStage },
			{ $sort: { createdAt: sortOrder } },

			{
				$facet: {
					summary: [{ $count: "checksCount" }],
					checks: [{ $skip: skip }, { $limit: rowsPerPage }],
				},
			},
			{
				$project: {
					checksCount: { $arrayElemAt: ["$summary.checksCount", 0] },
					checks: "$checks",
				},
			},
		]);

		return checks[0];
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getChecksByTeam";
		throw error;
	}
};

/**
 * Delete all checks for a monitor
 * @async
 * @param {string} monitorId
 * @returns {number}
 * @throws {Error}
 */

const deleteChecks = async (monitorId) => {
	try {
		const result = await Check.deleteMany({ monitorId });
		return result.deletedCount;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteChecks";
		throw error;
	}
};

/**
 * Delete all checks for a team
 * @async
 * @param {string} monitorId
 * @returns {number}
 * @throws {Error}
 */

const deleteChecksByTeamId = async (teamId) => {
	try {
		const teamMonitors = await Monitor.find({ teamId: teamId });
		let totalDeletedCount = 0;

		await Promise.all(
			teamMonitors.map(async (monitor) => {
				const result = await Check.deleteMany({ monitorId: monitor._id });
				totalDeletedCount += result.deletedCount;
				monitor.status = true;
				await monitor.save();
			})
		);

		return totalDeletedCount;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteChecksByTeamId";
		throw error;
	}
};

const updateChecksTTL = async (teamId, ttl) => {
	try {
		await Check.collection.dropIndex("expiry_1");
	} catch (error) {
		logger.error({
			message: error.message,
			service: SERVICE_NAME,
			method: "updateChecksTTL",
			stack: error.stack,
		});
	}

	try {
		await Check.collection.createIndex(
			{ expiry: 1 },
			{ expireAfterSeconds: ttl } // TTL in seconds, adjust as necessary
		);
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "updateChecksTTL";
		throw error;
	}
	// Update user
	try {
		await User.updateMany({ teamId: teamId }, { checkTTL: ttl });
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "updateChecksTTL";
		throw error;
	}
};

export {
	createCheck,
	getChecksByMonitor,
	getChecksByTeam,
	deleteChecks,
	deleteChecksByTeamId,
	updateChecksTTL,
};
