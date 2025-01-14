import Check from "../../models/Check.js";
import Monitor from "../../models/Monitor.js";
import User from "../../models/User.js";
import logger from "../../../utils/logger.js";
const SERVICE_NAME = "checkModule";
const dateRangeLookup = {
	day: new Date(new Date().setDate(new Date().getDate() - 1)),
	week: new Date(new Date().setDate(new Date().getDate() - 7)),
	month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
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

const getChecksCount = async (req) => {
	const monitorId = req.params.monitorId;
	const dateRange = req.query.dateRange;
	const filter = req.query.filter;
	// Build query
	const checksQuery = { monitorId: monitorId };
	// Filter checks by "day", "week", or "month"
	if (dateRange !== undefined) {
		checksQuery.createdAt = { $gte: dateRangeLookup[dateRange] };
	}

	if (filter !== undefined) {
		checksQuery.status = false;
		switch (filter) {
			case "all":
				break;
			case "down":
				break;
			case "resolve":
				checksQuery.statusCode = 5000;
				break;
			default:
				logger.warn({
					message: "invalid filter",
					service: SERVICE_NAME,
					method: "getChecksCount",
				});
				break;
		}
	}

	const count = await Check.countDocuments(checksQuery);
	return count;
};

/**
 * Get all checks for a monitor
 * @async
 * @param {string} monitorId
 * @returns {Promise<Array<Check>>}
 * @throws {Error}
 */

const getChecks = async (req) => {
	try {
		const { monitorId } = req.params;
		let { sortOrder, limit, dateRange, filter, page, rowsPerPage } = req.query;
		// Default limit to 0 if not provided
		limit = limit === undefined ? 0 : limit;

		// Default sort order is newest -> oldest
		sortOrder = sortOrder === "asc" ? 1 : -1;

		// Build query
		const checksQuery = { monitorId: monitorId };
		// Filter checks by "day", "week", or "month"
		if (dateRange !== undefined) {
			checksQuery.createdAt = { $gte: dateRangeLookup[dateRange] };
		}
		// Filter checks by status
		if (filter !== undefined) {
			checksQuery.status = false;
			switch (filter) {
				case "all":
					break;
				case "down":
					break;
				case "resolve":
					checksQuery.statusCode = 5000;
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

		// Need to skip and limit here
		let skip = 0;
		if (page && rowsPerPage) {
			skip = page * rowsPerPage;
		}
		const checks = await Check.find(checksQuery)
			.skip(skip)
			.limit(rowsPerPage)
			.sort({ createdAt: sortOrder });
		return checks;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getChecks";
		throw error;
	}
};

const getTeamChecks = async (req) => {
	try {
		const { teamId } = req.params;
		let { sortOrder, limit, dateRange, filter, page, rowsPerPage } = req.query;

		// Get monitorIDs
		const userMonitors = await Monitor.find({ teamId: teamId }).select("_id");

		//Build check query
		// Default limit to 0 if not provided
		limit = limit === undefined ? 0 : limit;
		// Default sort order is newest -> oldest
		sortOrder = sortOrder === "asc" ? 1 : -1;

		const checksQuery = { monitorId: { $in: userMonitors } };

		if (filter !== undefined) {
			checksQuery.status = false;
			switch (filter) {
				case "all":
					break;
				case "down":
					checksQuery.status = false;
					break;
				case "resolve":
					checksQuery.statusCode = 5000;
					break;
				default:
					logger.warn({
						message: "invalid filter",
						service: SERVICE_NAME,
						method: "getTeamChecks",
					});
					break;
			}
		}

		if (dateRange !== undefined) {
			checksQuery.createdAt = { $gte: dateRangeLookup[dateRange] };
		}

		// Skip and limit for pagination
		let skip = 0;
		if (page && rowsPerPage) {
			skip = page * rowsPerPage;
		}

		const checksCount = await Check.countDocuments(checksQuery);

		const checks = await Check.find(checksQuery)
			.skip(skip)
			.limit(rowsPerPage)
			.sort({ createdAt: sortOrder })
			.select(["monitorId", "status", "responseTime", "statusCode", "message"]);
		return { checksCount, checks };
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getTeamChecks";
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
	getChecksCount,
	getChecks,
	getTeamChecks,
	deleteChecks,
	deleteChecksByTeamId,
	updateChecksTTL,
};
