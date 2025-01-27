import ServiceRegistry from '../service/serviceRegistry.js';
import TranslationService from '../service/translationService.js';

const getTranslatedMessage = (key, language = 'en') => {
	console.log("getTranslatedMessage", key, language);
	const translationService = ServiceRegistry.get(TranslationService.SERVICE_NAME);
	return translationService.getTranslation(key, language);
};

const errorMessages = {
	// General Errors:
	FRIENDLY_ERROR: (language) => getTranslatedMessage('FRIENDLY_ERROR', language),
	UNKNOWN_ERROR: (language) => getTranslatedMessage('UNKNOWN_ERROR', language),

	// Auth Controller
	UNAUTHORIZED: (language) => getTranslatedMessage('UNAUTHORIZED', language),
	AUTH_ADMIN_EXISTS: (language) => getTranslatedMessage('AUTH_ADMIN_EXISTS', language),
	AUTH_INVITE_NOT_FOUND: (language) => getTranslatedMessage('AUTH_INVITE_NOT_FOUND', language),

	//Error handling middleware
	UNKNOWN_SERVICE: (language) => getTranslatedMessage('UNKNOWN_SERVICE', language),
	NO_AUTH_TOKEN: (language) => getTranslatedMessage('NO_AUTH_TOKEN', language),
	INVALID_AUTH_TOKEN: (language) => getTranslatedMessage('INVALID_AUTH_TOKEN', language),
	EXPIRED_AUTH_TOKEN: (language) => getTranslatedMessage('EXPIRED_AUTH_TOKEN', language),
	NO_REFRESH_TOKEN: (language) => getTranslatedMessage('NO_REFRESH_TOKEN', language),
	INVALID_REFRESH_TOKEN: (language) => getTranslatedMessage('INVALID_REFRESH_TOKEN', language),
	EXPIRED_REFRESH_TOKEN: (language) => getTranslatedMessage('EXPIRED_REFRESH_TOKEN', language),
	REQUEST_NEW_ACCESS_TOKEN: (language) => getTranslatedMessage('REQUEST_NEW_ACCESS_TOKEN', language),

	//Payload
	INVALID_PAYLOAD: (language) => getTranslatedMessage('INVALID_PAYLOAD', language),

	//Ownership Middleware
	VERIFY_OWNER_NOT_FOUND: (language) => getTranslatedMessage('VERIFY_OWNER_NOT_FOUND', language),
	VERIFY_OWNER_UNAUTHORIZED: (language) => getTranslatedMessage('VERIFY_OWNER_UNAUTHORIZED', language),

	//Permissions Middleware
	INSUFFICIENT_PERMISSIONS: (language) => getTranslatedMessage('INSUFFICIENT_PERMISSIONS', language),

	//DB Errors
	DB_USER_EXISTS: (language) => getTranslatedMessage('DB_USER_EXISTS', language),
	DB_USER_NOT_FOUND: (language) => getTranslatedMessage('DB_USER_NOT_FOUND', language),
	DB_TOKEN_NOT_FOUND: (language) => getTranslatedMessage('DB_TOKEN_NOT_FOUND', language),
	DB_RESET_PASSWORD_BAD_MATCH: (language) => getTranslatedMessage('DB_RESET_PASSWORD_BAD_MATCH', language),
	DB_FIND_MONITOR_BY_ID: (monitorId, language) => getTranslatedMessage('DB_FIND_MONITOR_BY_ID', language).replace('{monitorId}', monitorId),
	DB_DELETE_CHECKS: (monitorId, language) => getTranslatedMessage('DB_DELETE_CHECKS', language).replace('{monitorId}', monitorId),

	//Auth errors
	AUTH_INCORRECT_PASSWORD: (language) => getTranslatedMessage('AUTH_INCORRECT_PASSWORD', language),
	AUTH_UNAUTHORIZED: (language) => getTranslatedMessage('AUTH_UNAUTHORIZED', language),

	// Monitor Errors
	MONITOR_GET_BY_ID: (language) => getTranslatedMessage('MONITOR_GET_BY_ID', language),
	MONITOR_GET_BY_USER_ID: (language) => getTranslatedMessage('MONITOR_GET_BY_USER_ID', language),

	// Job Queue Errors
	JOB_QUEUE_WORKER_CLOSE: (language) => getTranslatedMessage('JOB_QUEUE_WORKER_CLOSE', language),
	JOB_QUEUE_DELETE_JOB: (language) => getTranslatedMessage('JOB_QUEUE_DELETE_JOB', language),
	JOB_QUEUE_OBLITERATE: (language) => getTranslatedMessage('JOB_QUEUE_OBLITERATE', language),

	// PING Operations
	PING_CANNOT_RESOLVE: (language) => getTranslatedMessage('PING_CANNOT_RESOLVE', language),

	// Status Page Errors
	STATUS_PAGE_NOT_FOUND: (language) => getTranslatedMessage('STATUS_PAGE_NOT_FOUND', language),
	STATUS_PAGE_URL_NOT_UNIQUE: (language) => getTranslatedMessage('STATUS_PAGE_URL_NOT_UNIQUE', language),

	// Docker
	DOCKER_FAIL: (language) => getTranslatedMessage('DOCKER_FAIL', language),
	DOCKER_NOT_FOUND: (language) => getTranslatedMessage('DOCKER_NOT_FOUND', language),

	// Port
	PORT_FAIL: (language) => getTranslatedMessage('PORT_FAIL', language),
};

const successMessages = {
	//Alert Controller
	ALERT_CREATE: (language) => getTranslatedMessage('ALERT_CREATE', language),
	ALERT_GET_BY_USER: (language) => getTranslatedMessage('ALERT_GET_BY_USER', language),
	ALERT_GET_BY_MONITOR: (language) => getTranslatedMessage('ALERT_GET_BY_MONITOR', language),
	ALERT_GET_BY_ID: (language) => getTranslatedMessage('ALERT_GET_BY_ID', language),
	ALERT_EDIT: (language) => getTranslatedMessage('ALERT_EDIT', language),
	ALERT_DELETE: (language) => getTranslatedMessage('ALERT_DELETE', language),

	// Auth Controller
	AUTH_CREATE_USER: (language) => getTranslatedMessage('AUTH_CREATE_USER', language),
	AUTH_LOGIN_USER: (language) => getTranslatedMessage('AUTH_LOGIN_USER', language),
	AUTH_LOGOUT_USER: (language) => getTranslatedMessage('AUTH_LOGOUT_USER', language),
	AUTH_UPDATE_USER: (language) => getTranslatedMessage('AUTH_UPDATE_USER', language),
	AUTH_CREATE_RECOVERY_TOKEN: (language) => getTranslatedMessage('AUTH_CREATE_RECOVERY_TOKEN', language),
	AUTH_VERIFY_RECOVERY_TOKEN: (language) => getTranslatedMessage('AUTH_VERIFY_RECOVERY_TOKEN', language),
	AUTH_RESET_PASSWORD: (language) => getTranslatedMessage('AUTH_RESET_PASSWORD', language),
	AUTH_ADMIN_CHECK: (language) => getTranslatedMessage('AUTH_ADMIN_CHECK', language),
	AUTH_DELETE_USER: (language) => getTranslatedMessage('AUTH_DELETE_USER', language),
	AUTH_TOKEN_REFRESHED: (language) => getTranslatedMessage('AUTH_TOKEN_REFRESHED', language),
	AUTH_GET_ALL_USERS: (language) => getTranslatedMessage('AUTH_GET_ALL_USERS', language),

	// Invite Controller
	INVITE_ISSUED: (language) => getTranslatedMessage('INVITE_ISSUED', language),
	INVITE_VERIFIED: (language) => getTranslatedMessage('INVITE_VERIFIED', language),

	// Check Controller
	CHECK_CREATE: (language) => getTranslatedMessage('CHECK_CREATE', language),
	CHECK_GET: (language) => getTranslatedMessage('CHECK_GET', language),
	CHECK_DELETE: (language) => getTranslatedMessage('CHECK_DELETE', language),
	CHECK_UPDATE_TTL: (language) => getTranslatedMessage('CHECK_UPDATE_TTL', language),

	//Monitor Controller
	MONITOR_GET_ALL: (language) => getTranslatedMessage('MONITOR_GET_ALL', language),
	MONITOR_STATS_BY_ID: (language) => getTranslatedMessage('MONITOR_STATS_BY_ID', language),
	MONITOR_GET_BY_ID: (language) => getTranslatedMessage('MONITOR_GET_BY_ID', language),
	MONITOR_GET_BY_TEAM_ID: (language) => getTranslatedMessage('MONITOR_GET_BY_TEAM_ID', language),
	MONITOR_GET_BY_USER_ID: (userId, language) => getTranslatedMessage('MONITOR_GET_BY_USER_ID', language).replace('{userId}', userId),
	MONITOR_CREATE: (language) => getTranslatedMessage('MONITOR_CREATE', language),
	MONITOR_DELETE: (language) => getTranslatedMessage('MONITOR_DELETE', language),
	MONITOR_EDIT: (language) => getTranslatedMessage('MONITOR_EDIT', language),
	MONITOR_CERTIFICATE: (language) => getTranslatedMessage('MONITOR_CERTIFICATE', language),
	MONITOR_DEMO_ADDED: (language) => getTranslatedMessage('MONITOR_DEMO_ADDED', language),

	// Queue Controller
	QUEUE_GET_METRICS: (language) => getTranslatedMessage('QUEUE_GET_METRICS', language),
	QUEUE_ADD_JOB: (language) => getTranslatedMessage('QUEUE_ADD_JOB', language),
	QUEUE_OBLITERATE: (language) => getTranslatedMessage('QUEUE_OBLITERATE', language),

	//Job Queue
	JOB_QUEUE_DELETE_JOB: (language) => getTranslatedMessage('JOB_QUEUE_DELETE_JOB', language),
	JOB_QUEUE_OBLITERATE: (language) => getTranslatedMessage('JOB_QUEUE_OBLITERATE', language),
	JOB_QUEUE_PAUSE_JOB: (language) => getTranslatedMessage('JOB_QUEUE_PAUSE_JOB', language),
	JOB_QUEUE_RESUME_JOB: (language) => getTranslatedMessage('JOB_QUEUE_RESUME_JOB', language),

	//Maintenance Window Controller
	MAINTENANCE_WINDOW_GET_BY_ID: (language) => getTranslatedMessage('MAINTENANCE_WINDOW_GET_BY_ID', language),
	MAINTENANCE_WINDOW_CREATE: (language) => getTranslatedMessage('MAINTENANCE_WINDOW_CREATE', language),
	MAINTENANCE_WINDOW_GET_BY_TEAM: (language) => getTranslatedMessage('MAINTENANCE_WINDOW_GET_BY_TEAM', language),
	MAINTENANCE_WINDOW_DELETE: (language) => getTranslatedMessage('MAINTENANCE_WINDOW_DELETE', language),
	MAINTENANCE_WINDOW_EDIT: (language) => getTranslatedMessage('MAINTENANCE_WINDOW_EDIT', language),

	//Ping Operations
	PING_SUCCESS: (language) => getTranslatedMessage('PING_SUCCESS', language),

	// App Settings
	GET_APP_SETTINGS: (language) => getTranslatedMessage('GET_APP_SETTINGS', language),
	UPDATE_APP_SETTINGS: (language) => getTranslatedMessage('UPDATE_APP_SETTINGS', language),

	// Status Page
	STATUS_PAGE_BY_URL: (language) => getTranslatedMessage('STATUS_PAGE_BY_URL', language),
	STATUS_PAGE_CREATE: (language) => getTranslatedMessage('STATUS_PAGE_CREATE', language),

	// Docker
	DOCKER_SUCCESS: (language) => getTranslatedMessage('DOCKER_SUCCESS', language),

	// Port
	PORT_SUCCESS: (language) => getTranslatedMessage('PORT_SUCCESS', language),
};

export { errorMessages, successMessages };
