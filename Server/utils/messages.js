const errorMessages = {
	// General Errors:
	FRIENDLY_ERROR: "Something went wrong...",
	UNKNOWN_ERROR: "An unknown error occurred",

	// Auth Controller
	UNAUTHORIZED: "Unauthorized access",
	AUTH_ADMIN_EXISTS: "Admin already exists",
	AUTH_INVITE_NOT_FOUND: "Invite not found",

	//Error handling middleware
	UNKNOWN_SERVICE: "Unknown service",
	NO_AUTH_TOKEN: "No auth token provided",
	INVALID_AUTH_TOKEN: "Invalid auth token",
	EXPIRED_AUTH_TOKEN: "Token expired",
	NO_REFRESH_TOKEN: "No refresh token provided",
	INVALID_REFRESH_TOKEN: "Invalid refresh token",
	EXPIRED_REFRESH_TOKEN: "Refresh token expired",
	REQUEST_NEW_ACCESS_TOKEN: "Request new access token",

	//Payload
	INVALID_PAYLOAD: "Invalid payload",

	//Ownership Middleware
	VERIFY_OWNER_NOT_FOUND: "Document not found",
	VERIFY_OWNER_UNAUTHORIZED: "Unauthorized access",

	//Permissions Middleware
	INSUFFICIENT_PERMISSIONS: "Insufficient permissions",

	//DB Errors
	DB_USER_EXISTS: "User already exists",
	DB_USER_NOT_FOUND: "User not found",
	DB_TOKEN_NOT_FOUND: "Token not found",
	DB_RESET_PASSWORD_BAD_MATCH: "New password must be different from old password",
	DB_FIND_MONITOR_BY_ID: (monitorId) => `Monitor with id ${monitorId} not found`,
	DB_DELETE_CHECKS: (monitorId) => `No checks found for monitor with id ${monitorId}`,

	//Auth errors
	AUTH_INCORRECT_PASSWORD: "Incorrect password",
	AUTH_UNAUTHORIZED: "Unauthorized access",

	// Monitor Errors
	MONITOR_GET_BY_ID: "Monitor not found",
	MONITOR_GET_BY_USER_ID: "No monitors found for user",

	// Job Queue Errors
	JOB_QUEUE_WORKER_CLOSE: "Error closing worker",
	JOB_QUEUE_DELETE_JOB: "Job not found in queue",
	JOB_QUEUE_OBLITERATE: "Error obliterating queue",

	// PING Operations
	PING_CANNOT_RESOLVE: "No response",

	// Status Page Errors
	STATUS_PAGE_NOT_FOUND: "Status page not found",
	STATUS_PAGE_URL_NOT_UNIQUE: "Status page url must be unique",

	// Docker
	DOCKER_FAIL: "Failed to fetch Docker container information",
	DOCKER_NOT_FOUND: "Docker container not found",
};

const successMessages = {
	//Alert Controller
	ALERT_CREATE: "Alert created successfully",
	ALERT_GET_BY_USER: "Got alerts successfully",
	ALERT_GET_BY_MONITOR: "Got alerts by Monitor successfully",
	ALERT_GET_BY_ID: "Got alert by Id successfully",
	ALERT_EDIT: "Alert edited successfully",
	ALERT_DELETE: "Alert deleted successfully",

	AUTH_CREATE_USER: "User created successfully",
	AUTH_LOGIN_USER: "User logged in successfully",
	AUTH_LOGOUT_USER: "User logged out successfully",
	AUTH_UPDATE_USER: "User updated successfully",
	AUTH_CREATE_RECOVERY_TOKEN: "Recovery token created successfully",
	AUTH_VERIFY_RECOVERY_TOKEN: "Recovery token verified successfully",
	AUTH_RESET_PASSWORD: "Password reset successfully",
	AUTH_ADMIN_CHECK: "Admin check completed successfully",
	AUTH_DELETE_USER: "User deleted successfully",
	AUTH_TOKEN_REFRESHED: "Auth token is refreshed",

	// Check Controller
	CHECK_CREATE: "Check created successfully",
	CHECK_GET: "Got checks successfully",
	CHECK_DELETE: "Checks deleted successfully",
	CHECK_UPDATE_TTL: "Checks TTL updated successfully",

	//Monitor Controller
	MONITOR_GET_ALL: "Got all monitors successfully",
	MONITOR_STATS_BY_ID: "Got monitor stats by Id successfully",
	MONITOR_GET_BY_ID: "Got monitor by Id successfully",
	MONITOR_GET_BY_USER_ID: (userId) => `Got monitor for ${userId} successfully"`,
	MONITOR_CREATE: "Monitor created successfully",
	MONITOR_DELETE: "Monitor deleted successfully",
	MONITOR_EDIT: "Monitor edited successfully",
	MONITOR_CERTIFICATE: "Got monitor certificate successfully",
	MONITOR_DEMO_ADDED: "Successfully added demo monitors",

	// Queue Controller
	QUEUE_GET_METRICS: "Got metrics successfully",
	QUEUE_ADD_JOB: "Job added successfully",
	QUEUE_OBLITERATE: "Queue obliterated",

	//Job Queue
	JOB_QUEUE_DELETE_JOB: "Job removed successfully",
	JOB_QUEUE_OBLITERATE: "Queue OBLITERATED!!!",
	JOB_QUEUE_PAUSE_JOB: "Job paused successfully",
	JOB_QUEUE_RESUME_JOB: "Job resumed successfully",

	//Maintenance Window Controller
	MAINTENANCE_WINDOW_GET_BY_ID: "Got Maintenance Window by Id successfully",
	MAINTENANCE_WINDOW_CREATE: "Maintenance Window created successfully",
	MAINTENANCE_WINDOW_GET_BY_TEAM: "Got Maintenance Windows by Team successfully",
	MAINTENANCE_WINDOW_DELETE: "Maintenance Window deleted successfully",
	MAINTENANCE_WINDOW_EDIT: "Maintenance Window edited successfully",

	//Ping Operations
	PING_SUCCESS: "Success",

	// App Settings
	GET_APP_SETTINGS: "Got app settings successfully",
	UPDATE_APP_SETTINGS: "Updated app settings successfully",

	// Status Page
	STATUS_PAGE_BY_URL: "Got status page by url successfully",
	STATUS_PAGE_CREATE: "Status page created successfully",

	// Docker
	DOCKER_SUCCESS: "Docker container status fetched successfully",
};

export { errorMessages, successMessages };
