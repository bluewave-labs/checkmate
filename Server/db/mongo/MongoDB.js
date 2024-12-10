import mongoose from "mongoose";
import UserModel from "../models/User.js";
import AppSettings from "../models/AppSettings.js";
import logger from "../../utils/logger.js";
const SERVICE_NAME = "MongoDB";

//****************************************
// DB Connection
//****************************************

const connect = async () => {
	try {
		const connectionString =
			process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017/uptime_db";
		await mongoose.connect(connectionString);
		// If there are no AppSettings, create one
		let appSettings = await AppSettings.find();
		if (appSettings.length === 0) {
			appSettings = new AppSettings({});
			await appSettings.save();
		}
		logger.info({ message: "Connected to MongoDB" });
	} catch (error) {
		logger.error({
			message: error.message,
			service: SERVICE_NAME,
			method: "connect",
			stack: error.stack,
		});
		throw error;
	}
};

const disconnect = async () => {
	try {
		logger.info({ message: "Disconnecting from MongoDB" });
		await mongoose.disconnect();
		logger.info({ message: "Disconnected from MongoDB" });
		return;
	} catch (error) {
		logger.error({
			message: error.message,
			service: SERVICE_NAME,
			method: "disconnect",
			stack: error.stack,
		});
	}
};

const checkSuperadmin = async (req, res) => {
	try {
		const superAdmin = await UserModel.findOne({ role: "superadmin" });
		if (superAdmin !== null) {
			return true;
		}
		return false;
	} catch (error) {
		throw error;
	}
};

//****************************************
// User Operations
//****************************************

import {
	insertUser,
	getUserByEmail,
	updateUser,
	deleteUser,
	deleteTeam,
	deleteAllOtherUsers,
	getAllUsers,
	logoutUser,
} from "./modules/userModule.js";

//****************************************
// Invite Token Operations
//****************************************

import {
	requestInviteToken,
	getInviteToken,
	getInviteTokenAndDelete,
} from "./modules/inviteModule.js";

//****************************************
// Recovery Operations
//****************************************
import {
	requestRecoveryToken,
	validateRecoveryToken,
	resetPassword,
} from "./modules/recoveryModule.js";

//****************************************
//  Monitors
//****************************************

import {
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
} from "./modules/monitorModule.js";

//****************************************
// Page Speed Checks
//****************************************

import {
	createPageSpeedCheck,
	deletePageSpeedChecksByMonitorId,
} from "./modules/pageSpeedCheckModule.js";

//****************************************
// Hardware Checks
//****************************************
import {
	createHardwareCheck,
	deleteHardwareChecksByMonitorId,
} from "./modules/hardwareCheckModule.js";

//****************************************
// Checks
//****************************************

import {
	createCheck,
	getChecksCount,
	getChecks,
	getTeamChecks,
	deleteChecks,
	deleteChecksByTeamId,
	updateChecksTTL,
} from "./modules/checkModule.js";

//****************************************
// Maintenance Window
//****************************************
import {
	createMaintenanceWindow,
	getMaintenanceWindowById,
	getMaintenanceWindowsByTeamId,
	getMaintenanceWindowsByMonitorId,
	deleteMaintenanceWindowById,
	deleteMaintenanceWindowByMonitorId,
	deleteMaintenanceWindowByUserId,
	editMaintenanceWindowById,
} from "./modules/maintenanceWindowModule.js";

//****************************************
// Notifications
//****************************************
import {
	createNotification,
	getNotificationsByMonitorId,
	deleteNotificationsByMonitorId,
} from "./modules/notificationModule.js";

//****************************************
// AppSettings
//****************************************
import { getAppSettings, updateAppSettings } from "./modules/settingsModule.js";

//****************************************
// Status Page
//****************************************
import { createStatusPage, getStatusPageByUrl } from "./modules/statusPageModule.js";

export default {
	connect,
	disconnect,
	insertUser,
	getUserByEmail,
	updateUser,
	deleteUser,
	deleteTeam,
	deleteAllOtherUsers,
	getAllUsers,
	logoutUser,
	requestInviteToken,
	getInviteToken,
	getInviteTokenAndDelete,
	requestRecoveryToken,
	validateRecoveryToken,
	resetPassword,
	checkSuperadmin,
	getAllMonitors,
	getAllMonitorsWithUptimeStats,
	getMonitorStatsById,
	getMonitorById,
	getMonitorsAndSummaryByTeamId,
	getMonitorsByTeamId,
	createMonitor,
	deleteMonitor,
	deleteAllMonitors,
	editMonitor,
	addDemoMonitors,
	createCheck,
	getChecksCount,
	getChecks,
	getTeamChecks,
	deleteChecks,
	deleteChecksByTeamId,
	updateChecksTTL,
	deleteMonitorsByUserId,
	createPageSpeedCheck,
	deletePageSpeedChecksByMonitorId,
	createHardwareCheck,
	deleteHardwareChecksByMonitorId,
	createMaintenanceWindow,
	getMaintenanceWindowsByTeamId,
	getMaintenanceWindowById,
	getMaintenanceWindowsByMonitorId,
	deleteMaintenanceWindowById,
	deleteMaintenanceWindowByMonitorId,
	deleteMaintenanceWindowByUserId,
	editMaintenanceWindowById,
	createNotification,
	getNotificationsByMonitorId,
	deleteNotificationsByMonitorId,
	getAppSettings,
	updateAppSettings,
	createStatusPage,
	getStatusPageByUrl,
};
