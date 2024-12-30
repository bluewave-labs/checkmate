import Monitor from "../../models/Monitor.js";
import Check from "../../models/Check.js";
import PageSpeedCheck from "../../models/PageSpeedCheck.js";
import HardwareCheck from "../../models/HardwareCheck.js";
import { errorMessages } from "../../../utils/messages.js";
import Notification from "../../models/Notification.js";
import { NormalizeData } from "../../../utils/dataUtils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoMonitorsPath = path.resolve(__dirname, "../../../utils/demoMonitors.json");
const demoMonitors = JSON.parse(fs.readFileSync(demoMonitorsPath, "utf8"));

const SERVICE_NAME = "monitorModule";

const CHECK_MODEL_LOOKUP = {
	http: Check,
	ping: Check,
	docker: Check,
	port: Check,
	pagespeed: PageSpeedCheck,
	hardware: HardwareCheck,
};

/**
 * Get all monitors
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Array<Monitor>>}
 * @throws {Error}
 */
const getAllMonitors = async (req, res) => {
	try {
		const monitors = await Monitor.find();
		return monitors;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getAllMonitors";
		throw error;
	}
};

/**
 * Get all monitors with uptime stats for 1,7,30, and 90 days
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Array<Monitor>>}
 * @throws {Error}
 */
const getAllMonitorsWithUptimeStats = async () => {
	const timeRanges = {
		1: new Date(Date.now() - 24 * 60 * 60 * 1000),
		7: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		30: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		90: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
	};

	try {
		const monitors = await Monitor.find();
		const monitorsWithStats = await Promise.all(
			monitors.map(async (monitor) => {
				const model = CHECK_MODEL_LOOKUP[monitor.type];

				const uptimeStats = await Promise.all(
					Object.entries(timeRanges).map(async ([days, startDate]) => {
						const checks = await model.find({
							monitorId: monitor._id,
							createdAt: { $gte: startDate },
						});
						return [days, getUptimePercentage(checks)];
					})
				);

				return {
					...monitor.toObject(),
					...Object.fromEntries(uptimeStats),
				};
			})
		);

		return monitorsWithStats;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getAllMonitorsWithUptimeStats";
		throw error;
	}
};

/**
 * Function to calculate uptime duration based on the most recent check.
 * @param {Array} checks Array of check objects.
 * @returns {number} Uptime duration in ms.
 */
const calculateUptimeDuration = (checks) => {
	if (!checks || checks.length === 0) {
		return 0;
	}
	const latestCheck = new Date(checks[0].createdAt);
	let latestDownCheck = 0;

	for (let i = checks.length - 1; i >= 0; i--) {
		if (checks[i].status === false) {
			latestDownCheck = new Date(checks[i].createdAt);
			break;
		}
	}

	// If no down check is found, uptime is from the last check to now
	if (latestDownCheck === 0) {
		return Date.now() - new Date(checks[checks.length - 1].createdAt);
	}

	// Otherwise the uptime is from the last check to the last down check
	return latestCheck - latestDownCheck;
};

/**
 * Helper function to get duration since last check
 * @param {Array} checks Array of check objects.
 * @returns {number} Timestamp of the most recent check.
 */
const getLastChecked = (checks) => {
	if (!checks || checks.length === 0) {
		return 0; // Handle case when no checks are available
	}
	// Data is sorted newest->oldest, so last check is the most recent
	return new Date() - new Date(checks[0].createdAt);
};

/**
 * Helper function to get latestResponseTime
 * @param {Array} checks Array of check objects.
 * @returns {number} Timestamp of the most recent check.
 */
const getLatestResponseTime = (checks) => {
	if (!checks || checks.length === 0) {
		return 0;
	}

	return checks[0]?.responseTime ?? 0;
};

/**
 * Helper function to get average response time
 * @param {Array} checks Array of check objects.
 * @returns {number} Timestamp of the most recent check.
 */
const getAverageResponseTime = (checks) => {
	if (!checks || checks.length === 0) {
		return 0;
	}

	const validChecks = checks.filter((check) => typeof check.responseTime === "number");
	if (validChecks.length === 0) {
		return 0;
	}
	const aggResponseTime = validChecks.reduce((sum, check) => {
		return sum + check.responseTime;
	}, 0);
	return aggResponseTime / validChecks.length;
};

/**
 * Helper function to get percentage 24h uptime
 * @param {Array} checks Array of check objects.
 * @returns {number} Timestamp of the most recent check.
 */

const getUptimePercentage = (checks) => {
	if (!checks || checks.length === 0) {
		return 0;
	}
	const upCount = checks.reduce((count, check) => {
		return check.status === true ? count + 1 : count;
	}, 0);
	return (upCount / checks.length) * 100;
};

/**
 * Helper function to get all incidents
 * @param {Array} checks Array of check objects.
 * @returns {number} Timestamp of the most recent check.
 */

const getIncidents = (checks) => {
	if (!checks || checks.length === 0) {
		return 0; // Handle case when no checks are available
	}
	return checks.reduce((acc, check) => {
		return check.status === false ? (acc += 1) : acc;
	}, 0);
};

/**
 * Get date range parameters
 * @param {string} dateRange - 'day' | 'week' | 'month' | 'all'
 * @returns {Object} Start and end dates
 */
const getDateRange = (dateRange) => {
	const startDates = {
		day: new Date(new Date().setDate(new Date().getDate() - 1)),
		week: new Date(new Date().setDate(new Date().getDate() - 7)),
		month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
		all: new Date(0),
	};
	return {
		start: startDates[dateRange],
		end: new Date(),
	};
};

/**
 * Get checks for a monitor
 * @param {string} monitorId - Monitor ID
 * @param {Object} model - Check model to use
 * @param {Object} dateRange - Date range parameters
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<Object>} All checks and date-ranged checks
 */
const getMonitorChecks = async (monitorId, model, dateRange, sortOrder) => {
	const [checksAll, checksForDateRange] = await Promise.all([
		model.find({ monitorId }).sort({ createdAt: sortOrder }),
		model
			.find({
				monitorId,
				createdAt: { $gte: dateRange.start, $lte: dateRange.end },
			})
			.sort({ createdAt: sortOrder }),
	]);
	return { checksAll, checksForDateRange };
};

/**
 * Process checks for display
 * @param {Array} checks - Checks to process
 * @param {number} numToDisplay - Number of checks to display
 * @param {boolean} normalize - Whether to normalize the data
 * @returns {Array} Processed checks
 */
const processChecksForDisplay = (normalizeData, checks, numToDisplay, normalize) => {
	let processedChecks = checks;
	if (numToDisplay && checks.length > numToDisplay) {
		const n = Math.ceil(checks.length / numToDisplay);
		processedChecks = checks.filter((_, index) => index % n === 0);
	}
	return normalize ? normalizeData(processedChecks, 1, 100) : processedChecks;
};

/**
 * Get time-grouped checks based on date range
 * @param {Array} checks Array of check objects
 * @param {string} dateRange 'day' | 'week' | 'month'
 * @returns {Object} Grouped checks by time period
 */
const groupChecksByTime = (checks, dateRange) => {
	return checks.reduce((acc, check) => {
		// Validate the date
		const checkDate = new Date(check.createdAt);
		if (Number.isNaN(checkDate.getTime()) || checkDate.getTime() === 0) {
			return acc;
		}

		const time =
			dateRange === "day"
				? checkDate.setMinutes(0, 0, 0)
				: checkDate.toISOString().split("T")[0];

		if (!acc[time]) {
			acc[time] = { time, checks: [] };
		}
		acc[time].checks.push(check);
		return acc;
	}, {});
};

/**
 * Calculate aggregate stats for a group of checks
 * @param {Object} group Group of checks
 * @returns {Object} Stats for the group
 */
const calculateGroupStats = (group) => {
	const totalChecks = group.checks.length;

	const checksWithResponseTime = group.checks.filter(
		(check) => typeof check.responseTime === "number" && !Number.isNaN(check.responseTime)
	);

	return {
		time: group.time,
		uptimePercentage: getUptimePercentage(group.checks),
		totalChecks,
		totalIncidents: group.checks.filter((check) => !check.status).length,
		avgResponseTime:
			checksWithResponseTime.length > 0
				? checksWithResponseTime.reduce((sum, check) => sum + check.responseTime, 0) /
					checksWithResponseTime.length
				: 0,
	};
};

/**
 * Get stats by monitor ID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Monitor>}
 * @throws {Error}
 */
const getMonitorStatsById = async (req) => {
	try {
		const { monitorId } = req.params;

		// Get monitor, if we can't find it, abort with error
		const monitor = await Monitor.findById(monitorId);
		if (monitor === null || monitor === undefined) {
			throw new Error(errorMessages.DB_FIND_MONITOR_BY_ID(monitorId));
		}

		// Get query params
		let { limit, sortOrder, dateRange, numToDisplay, normalize } = req.query;
		const sort = sortOrder === "asc" ? 1 : -1;

		// Get Checks for monitor in date range requested
		const model = CHECK_MODEL_LOOKUP[monitor.type];
		const dates = getDateRange(dateRange);
		const { checksAll, checksForDateRange } = await getMonitorChecks(
			monitorId,
			model,
			dates,
			sort
		);

		// Build monitor stats
		const monitorStats = {
			...monitor.toObject(),
			uptimeDuration: calculateUptimeDuration(checksAll),
			lastChecked: getLastChecked(checksAll),
			latestResponseTime: getLatestResponseTime(checksAll),
			periodIncidents: getIncidents(checksForDateRange),
			periodTotalChecks: checksForDateRange.length,
			checks: processChecksForDisplay(
				NormalizeData,
				checksForDateRange,
				numToDisplay,
				normalize
			),
		};

		if (
			monitor.type === "http" ||
			monitor.type === "ping" ||
			monitor.type === "docker" ||
			monitor.type === "port"
		) {
			// HTTP/PING Specific stats
			monitorStats.periodAvgResponseTime = getAverageResponseTime(checksForDateRange);
			monitorStats.periodUptime = getUptimePercentage(checksForDateRange);
			const groupedChecks = groupChecksByTime(checksForDateRange, dateRange);
			monitorStats.aggregateData = Object.values(groupedChecks).map(calculateGroupStats);
		}

		return monitorStats;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getMonitorStatsById";
		throw error;
	}
};

/**
 * Get a monitor by ID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Monitor>}
 * @throws {Error}
 */
const getMonitorById = async (monitorId) => {
	try {
		const monitor = await Monitor.findById(monitorId);
		if (monitor === null || monitor === undefined) {
			const error = new Error(errorMessages.DB_FIND_MONITOR_BY_ID(monitorId));
			error.status = 404;
			throw error;
		}
		// Get notifications
		const notifications = await Notification.find({
			monitorId: monitorId,
		});

		// Update monitor with notifications and save
		monitor.notifications = notifications;
		await monitor.save();

		return monitor;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getMonitorById";
		throw error;
	}
};

/**
 * Get monitors and Summary by TeamID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Array<Monitor>>}
 * @throws {Error}
 */

const getMonitorsAndSummaryByTeamId = async (teamId, type) => {
	try {
		const monitors = await Monitor.find({ teamId, type });
		const monitorCounts = monitors.reduce(
			(acc, monitor) => {
				if (monitor.status === true) {
					acc.up += 1;
				} else if (monitor.status === false) {
					acc.down += 1;
				} else if (monitor.isActive === false) {
					acc.paused += 1;
				}
				return acc;
			},
			{ up: 0, down: 0, paused: 0 }
		);
		monitorCounts.total = monitors.length;
		return { monitors, monitorCounts };
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getMonitorsAndSummaryByTeamId";
		throw error;
	}
};

/**
 * Get monitors by TeamID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Array<Monitor>>}
 * @throws {Error}
 */
const getMonitorsByTeamId = async (req, res) => {
	try {
		let {
			limit,
			type,
			status,
			checkOrder,
			normalize,
			page,
			rowsPerPage,
			filter,
			field,
			order,
		} = req.query;

		const monitorQuery = { teamId: req.params.teamId };

		if (type !== undefined) {
			monitorQuery.type = Array.isArray(type) ? { $in: type } : type;
		}
		// Add filter if provided
		// $options: "i" makes the search case-insensitive
		if (filter !== undefined) {
			monitorQuery.$or = [
				{ name: { $regex: filter, $options: "i" } },
				{ url: { $regex: filter, $options: "i" } },
			];
		}
		const monitorCount = await Monitor.countDocuments(monitorQuery);

		// Pagination
		const skip = page && rowsPerPage ? page * rowsPerPage : 0;

		// Build Sort option
		const sort = field ? { [field]: order === "asc" ? 1 : -1 } : {};

		const monitors = await Monitor.find(monitorQuery)
			.skip(skip)
			.limit(rowsPerPage)
			.sort(sort);

		// Early return if limit is set to -1, indicating we don't want any checks
		if (limit === "-1") {
			return { monitors, monitorCount };
		}
		// Map each monitor to include its associated checks
		const monitorsWithChecks = await Promise.all(
			monitors.map(async (monitor) => {
				let model = CHECK_MODEL_LOOKUP[monitor.type];

				// Checks are order newest -> oldest
				let checks = await model
					.find({
						monitorId: monitor._id,
						...(status && { status }),
					})
					.sort({ createdAt: checkOrder === "asc" ? 1 : -1 })

					.limit(limit || 0);

				//Normalize checks if requested
				if (normalize !== undefined) {
					checks = NormalizeData(checks, 10, 100);
				}
				return { ...monitor.toObject(), checks };
			})
		);
		return { monitors: monitorsWithChecks, monitorCount };
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getMonitorsByTeamId";
		throw error;
	}
};

/**
 * Create a monitor
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Monitor>}
 * @throws {Error}
 */
const createMonitor = async (req, res) => {
	try {
		const monitor = new Monitor({ ...req.body });
		// Remove notifications fom monitor as they aren't needed here
		monitor.notifications = undefined;
		await monitor.save();
		return monitor;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "createMonitor";
		throw error;
	}
};

/**
 * Delete a monitor by ID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Monitor>}
 * @throws {Error}
 */
const deleteMonitor = async (req, res) => {
	const monitorId = req.params.monitorId;
	try {
		const monitor = await Monitor.findByIdAndDelete(monitorId);
		if (!monitor) {
			throw new Error(errorMessages.DB_FIND_MONITOR_BY_ID(monitorId));
		}
		return monitor;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteMonitor";
		throw error;
	}
};

/**
 * DELETE ALL MONITORS (TEMP)
 */

const deleteAllMonitors = async (teamId) => {
	try {
		const monitors = await Monitor.find({ teamId });
		const { deletedCount } = await Monitor.deleteMany({ teamId });

		return { monitors, deletedCount };
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteAllMonitors";
		throw error;
	}
};

/**
 * Delete all monitors associated with a user ID
 * @async
 * @param {string} userId - The ID of the user whose monitors are to be deleted.
 * @returns {Promise} A promise that resolves when the operation is complete.
 */
const deleteMonitorsByUserId = async (userId) => {
	try {
		const result = await Monitor.deleteMany({ userId: userId });
		return result;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteMonitorsByUserId";
		throw error;
	}
};

/**
 * Edit a monitor by ID
 * @async
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Monitor>}
 * @throws {Error}
 */
const editMonitor = async (candidateId, candidateMonitor) => {
	candidateMonitor.notifications = undefined;

	try {
		const editedMonitor = await Monitor.findByIdAndUpdate(candidateId, candidateMonitor, {
			new: true,
		});
		return editedMonitor;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "editMonitor";
		throw error;
	}
};

const addDemoMonitors = async (userId, teamId) => {
	try {
		const demoMonitorsToInsert = demoMonitors.map((monitor) => {
			return {
				userId,
				teamId,
				name: monitor.name,
				description: monitor.name,
				type: "http",
				url: monitor.url,
				interval: 60000,
			};
		});
		const insertedMonitors = await Monitor.insertMany(demoMonitorsToInsert);
		return insertedMonitors;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "addDemoMonitors";
		throw error;
	}
};

export {
	getAllMonitors,
	getAllMonitorsWithUptimeStats,
	getMonitorStatsById,
	getMonitorById,
	getMonitorsAndSummaryByTeamId,
	getMonitorsByTeamId,
	createMonitor,
	deleteMonitor,
	deleteAllMonitors,
	deleteMonitorsByUserId,
	editMonitor,
	addDemoMonitors,
};

// Helper functions
export {
	calculateUptimeDuration,
	getLastChecked,
	getLatestResponseTime,
	getAverageResponseTime,
	getUptimePercentage,
	getIncidents,
	getDateRange,
	getMonitorChecks,
	processChecksForDisplay,
	groupChecksByTime,
	calculateGroupStats,
};
