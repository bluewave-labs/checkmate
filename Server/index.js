import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger.js";
import { verifyJWT } from "./middleware/verifyJWT.js";
import { handleErrors } from "./middleware/handleErrors.js";
import { fileURLToPath } from "url";

import AuthRoutes from "./routes/authRoute.js";
import AuthController from "./controllers/authController.js";

import InviteRoutes from "./routes/inviteRoute.js";
import InviteController from "./controllers/inviteController.js";

import MonitorRoutes from "./routes/monitorRoute.js";
import MonitorController from "./controllers/monitorController.js";

import CheckRoutes from "./routes/checkRoute.js";
import CheckController from "./controllers/checkController.js";

import MaintenanceWindowRoutes from "./routes/maintenanceWindowRoute.js";
import MaintenanceWindowController from "./controllers/maintenanceWindowController.js";

import SettingsRoutes from "./routes/settingsRoute.js";
import SettingsController from "./controllers/settingsController.js";

import StatusPageRoutes from "./routes/statusPageRoute.js";
import StatusPageController from "./controllers/statusPageController.js";

import QueueRoutes from "./routes/queueRoute.js";
import QueueController from "./controllers/queueController.js";

//JobQueue service and dependencies
import JobQueue from "./service/jobQueue.js";
import { Queue, Worker } from "bullmq";

//Network service and dependencies
import NetworkService from "./service/networkService.js";
import axios from "axios";
import ping from "ping";
import http from "http";
import Docker from "dockerode";
import net from "net";

// Email service and dependencies
import EmailService from "./service/emailService.js";
import nodemailer from "nodemailer";
import pkg from "handlebars";
const { compile } = pkg;
import mjml2html from "mjml";

// Settings Service and dependencies
import SettingsService from "./service/settingsService.js";
import AppSettings from "./db/models/AppSettings.js";

// Status Service and dependencies
import StatusService from "./service/statusService.js";

// Notification Service and dependencies
import NotificationService from "./service/notificationService.js";

// Service Registry
import ServiceRegistry from "./service/serviceRegistry.js";

import MongoDB from "./db/mongo/MongoDB.js";

const SERVICE_NAME = "Server";
const SHUTDOWN_TIMEOUT = 1000;
let isShuttingDown = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiSpec = JSON.parse(
	fs.readFileSync(path.join(__dirname, "openapi.json"), "utf8")
);

let server;

const PORT = 5000;

const shutdown = async () => {
	if (isShuttingDown) {
		return;
	}
	isShuttingDown = true;
	logger.info({ message: "Attempting graceful shutdown" });
	setTimeout(() => {
		logger.error({
			message: "Could not shut down in time, forcing shutdown",
			service: SERVICE_NAME,
			method: "shutdown",
		});
		process.exit(1);
	}, SHUTDOWN_TIMEOUT);
	try {
		server.close();
		await ServiceRegistry.get(JobQueue.SERVICE_NAME).obliterate();
		await ServiceRegistry.get(MongoDB.SERVICE_NAME).disconnect();
		logger.info({ message: "Graceful shutdown complete" });
		process.exit(0);
	} catch (error) {
		logger.error({
			message: error.message,
			service: SERVICE_NAME,
			method: "shutdown",
			stack: error.stack,
		});
	}
};
// Need to wrap server setup in a function to handle async nature of JobQueue
const startApp = async () => {
	const app = express();

	// Create DB
	const db = new MongoDB();
	await db.connect();

	// Create services
	const settingsService = new SettingsService(AppSettings);
	await settingsService.loadSettings();
	const emailService = new EmailService(
		settingsService,
		fs,
		path,
		compile,
		mjml2html,
		nodemailer,
		logger
	);
	const networkService = new NetworkService(axios, ping, logger, http, Docker, net);
	const statusService = new StatusService(db, logger);
	const notificationService = new NotificationService(emailService, db, logger);
	const jobQueue = await JobQueue.createJobQueue(
		db,
		networkService,
		statusService,
		notificationService,
		settingsService,
		logger,
		Queue,
		Worker
	);

	// Register services
	ServiceRegistry.register(JobQueue.SERVICE_NAME, jobQueue);
	ServiceRegistry.register(MongoDB.SERVICE_NAME, db);
	ServiceRegistry.register(SettingsService.SERVICE_NAME, settingsService);
	ServiceRegistry.register(EmailService.SERVICE_NAME, emailService);
	ServiceRegistry.register(NetworkService.SERVICE_NAME, networkService);
	ServiceRegistry.register(StatusService.SERVICE_NAME, statusService);
	ServiceRegistry.register(NotificationService.SERVICE_NAME, notificationService);
	server = app.listen(PORT, () => {
		logger.info({ message: `server started on port:${PORT}` });
	});

	process.on("SIGUSR2", shutdown);
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	//Create controllers
	const authController = new AuthController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME),
		ServiceRegistry.get(EmailService.SERVICE_NAME),
		ServiceRegistry.get(JobQueue.SERVICE_NAME)
	);

	const monitorController = new MonitorController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME),
		ServiceRegistry.get(JobQueue.SERVICE_NAME)
	);

	const settingsController = new SettingsController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME)
	);

	const checkController = new CheckController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME)
	);

	const inviteController = new InviteController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME),
		ServiceRegistry.get(EmailService.SERVICE_NAME)
	);

	const maintenanceWindowController = new MaintenanceWindowController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME),
		ServiceRegistry.get(SettingsService.SERVICE_NAME)
	);

	const queueController = new QueueController(ServiceRegistry.get(JobQueue.SERVICE_NAME));

	const statusPageController = new StatusPageController(
		ServiceRegistry.get(MongoDB.SERVICE_NAME)
	);

	//Create routes
	const authRoutes = new AuthRoutes(authController);
	const monitorRoutes = new MonitorRoutes(monitorController);
	const settingsRoutes = new SettingsRoutes(settingsController);
	const checkRoutes = new CheckRoutes(checkController);
	const inviteRoutes = new InviteRoutes(inviteController);
	const maintenanceWindowRoutes = new MaintenanceWindowRoutes(
		maintenanceWindowController
	);
	const queueRoutes = new QueueRoutes(queueController);
	const statusPageRoutes = new StatusPageRoutes(statusPageController);
	// Middleware
	app.use(
		cors()
		//We will add configuration later
	);
	app.use(express.json());
	app.use(helmet());
	// Swagger UI
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

	//routes
	app.use("/api/v1/auth", authRoutes.getRouter());
	app.use("/api/v1/settings", verifyJWT, settingsRoutes.getRouter());
	app.use("/api/v1/invite", inviteRoutes.getRouter());
	app.use("/api/v1/monitors", verifyJWT, monitorRoutes.getRouter());
	app.use("/api/v1/checks", verifyJWT, checkRoutes.getRouter());
	app.use("/api/v1/maintenance-window", verifyJWT, maintenanceWindowRoutes.getRouter());
	app.use("/api/v1/queue", verifyJWT, queueRoutes.getRouter());
	app.use("/api/v1/status-page", statusPageRoutes.getRouter());
	app.use(handleErrors);
};

startApp().catch((error) => {
	logger.error({
		message: error.message,
		service: SERVICE_NAME,
		method: "startApp",
		stack: error.stack,
	});
	process.exit(1);
});
