import axios from "axios";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const FALLBACK_BASE_URL = "http://localhost:5000/api/v1";
import { clearAuthState } from "../Features/Auth/authSlice";
import { clearUptimeMonitorState } from "../Features/UptimeMonitors/uptimeMonitorsSlice";
import { createToast } from "./toastUtils";

class NetworkService {
	constructor(store, dispatch, navigate) {
		this.store = store;
		this.dispatch = dispatch;
		this.navigate = navigate;
		let baseURL = BASE_URL;
		this.axiosInstance = axios.create();
		this.setBaseUrl(baseURL);
		this.unsubscribe = store.subscribe(() => {
			const state = store.getState();
			if (BASE_URL !== undefined) {
				baseURL = BASE_URL;
			} else if (state?.settings?.apiBaseUrl ?? null) {
				baseURL = state.settings.apiBaseUrl;
			} else {
				baseURL = FALLBACK_BASE_URL;
			}
			this.setBaseUrl(baseURL);
		});
		this.axiosInstance.interceptors.response.use(
			(response) => response,
			(error) => {
				if (!error.request && error.response && error.response.status === 401) {
					dispatch(clearAuthState());
					dispatch(clearUptimeMonitorState());
					navigate("/login");
				} else if (error.request && !error.response) {
					return Promise.reject(error);
				}
				return Promise.reject(error);
			}
		);
	}

	setBaseUrl = (url) => {
		this.axiosInstance.defaults.baseURL = url;
	};

	cleanup() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	/**
	 *
	 * ************************************
	 * Create a new monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The monitor ID to be sent in the param.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 */

	async getMonitorById(config) {
		return this.axiosInstance.get(`/monitors/${config.monitorId}`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 *
	 * ************************************
	 * Create a new monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {Object} config.monitor - The monitor object to be sent in the request body.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async createMonitor(config) {
		return this.axiosInstance.post(`/monitors`, config.monitor, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 *
	 * ************************************
	 * Check the endpoint resolution
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {Object} config.monitorURL - The monitor url to be sent in the request body.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async checkEndpointResolution(config) {
		const { authToken, monitorURL } = config;
		const params = new URLSearchParams();

		if (monitorURL) params.append("monitorURL", monitorURL);

		return this.axiosInstance.get(`/monitors/resolution/url?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 *
	 * ************************************
	 * Gets monitors and summary of stats by TeamID
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.teamId - Team ID
	 * @param {Array<string>} config.types - Array of monitor types
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async getMonitorsSummaryByTeamId(config) {
		const params = new URLSearchParams();

		if (config.types) {
			config.types.forEach((type) => {
				params.append("type", type);
			});
		}
		return this.axiosInstance.get(
			`/monitors/team/summary/${config.teamId}?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * ************************************
	 * Get all uptime monitors for a Team
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.teamId - The ID of the team whose monitors are to be retrieved.
	 * @param {number} [config.limit] - The maximum number of checks to retrieve.  0 for all, -1 for none
	 * @param {Array<string>} [config.types] - The types of monitors to retrieve.
	 * @param {number} [config.page] - The page number for pagination.
	 * @param {number} [config.rowsPerPage] - The number of rows per page for pagination.
	 * @param {string} [config.filter] - The filter to apply to the monitors.
	 * @param {string} [config.field] - The field to sort by.
	 * @param {string} [config.order] - The order in which to sort the field.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 */

	async getMonitorsByTeamId(config) {
		const { authToken, teamId, limit, types, page, rowsPerPage, filter, field, order } =
			config;

		const params = new URLSearchParams();

		if (limit) params.append("limit", limit);
		if (types) {
			types.forEach((type) => {
				params.append("type", type);
			});
		}
		if (page) params.append("page", page);
		if (rowsPerPage) params.append("rowsPerPage", rowsPerPage);
		if (filter) params.append("filter", filter);
		if (field) params.append("field", field);
		if (order) params.append("order", order);

		return this.axiosInstance.get(`/monitors/team/${teamId}?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Get stats for a monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor whose statistics are to be retrieved.
	 * @param {string} config.sortOrder - The order in which to sort the retrieved statistics.
	 * @param {number} config.limit - The maximum number of statistics to retrieve.
	 * @param {string} config.dateRange - The date range for which to retrieve statistics.
	 * @param {number} config.numToDisplay - The number of checks to display.
	 * @param {boolean} config.normalize - Whether to normalize the retrieved statistics.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 */
	async getStatsByMonitorId(config) {
		const params = new URLSearchParams();
		if (config.sortOrder) params.append("sortOrder", config.sortOrder);
		if (config.limit) params.append("limit", config.limit);
		if (config.dateRange) params.append("dateRange", config.dateRange);
		if (config.numToDisplay) params.append("numToDisplay", config.numToDisplay);
		if (config.normalize) params.append("normalize", config.normalize);

		return this.axiosInstance.get(
			`/monitors/stats/${config.monitorId}?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
				},
			}
		);
	}

	async getHardwareDetailsByMonitorId(config) {
		const params = new URLSearchParams();
		if (config.dateRange) params.append("dateRange", config.dateRange);

		return this.axiosInstance.get(
			`/monitors/hardware/details/${config.monitorId}?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
				},
			}
		);
	}
	async getUptimeDetailsById(config) {
		const params = new URLSearchParams();
		if (config.dateRange) params.append("dateRange", config.dateRange);
		if (config.normalize) params.append("normalize", config.normalize);

		return this.axiosInstance.get(
			`/monitors/uptime/details/${config.monitorId}?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
				},
			}
		);
	}

	/**
	 * ************************************
	 * Updates a single monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor to be updated.
	 * @param {Object} config.updatedFields - The fields to be updated for the monitor.
	 * @returns {Promise<AxiosResponse>} The response from the axios PUT request.
	 */
	async updateMonitor(config) {
		return this.axiosInstance.put(`/monitors/${config.monitorId}`, config.updatedFields, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Deletes a single monitor by its ID
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor to be deleted.
	 * @returns {Promise<AxiosResponse>} The response from the axios DELETE request.
	 */
	async deleteMonitorById(config) {
		return this.axiosInstance.delete(`/monitors/${config.monitorId}`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Deletes all checks for all monitor by teamID
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.teamId - The team ID of the monitors to be deleted.
	 * @returns {Promise<AxiosResponse>} The response from the axios DELETE request.
	 */
	async deleteChecksByTeamId(config) {
		return this.axiosInstance.delete(`/checks/team/${config.teamId}`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}
	/**
	 * ************************************
	 * Pauses a single monitor by its ID
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor to be paused.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async pauseMonitorById(config) {
		return this.axiosInstance.post(
			`/monitors/pause/${config.monitorId}`,
			{},
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * ************************************
	 * Adds demo monitors
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async addDemoMonitors(config) {
		return this.axiosInstance.post(
			`/monitors/demo`,
			{},
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * ************************************
	 * Deletes all monitors for a team by team ID
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @returns {Promise<AxiosResponse>} The response from the axios DELETE request.
	 */
	async deleteAllMonitors(config) {
		return this.axiosInstance.delete(`/monitors/`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Gets the certificate expiry for a monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor whose certificate expiry is to be retrieved.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async getCertificateExpiry(config) {
		return this.axiosInstance.get(`/monitors/certificate/${config.monitorId}`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
			},
		});
	}

	/**
	 * ************************************
	 * Registers a new user
	 * ************************************
	 *
	 * @async
	 * @param {Object} form - The form data for the new user to be registered.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async registerUser(form) {
		return this.axiosInstance.post(`/auth/register`, form);
	}

	/**
	 * ************************************
	 * Logs in a user
	 * ************************************
	 *
	 * @async
	 * @param {Object} form - The form data for the user to be logged in.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async loginUser(form) {
		return this.axiosInstance.post(`/auth/login`, form);
	}

	/**
	 * ************************************
	 * Updates a user
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.userId - The ID of the user to be updated.
	 * @param {Object} config.form - The form data for the user to be updated.
	 * @returns {Promise<AxiosResponse>} The response from the axios PUT request.
	 *
	 */
	async updateUser(config) {
		return this.axiosInstance.put(`/auth/user/${config.userId}`, config.form, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
			},
		});
	}

	/**
	 * ************************************
	 * Deletes a user
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.userId - The ID of the user to be deleted.
	 *
	 **/
	async deleteUser(config) {
		return this.axiosInstance.delete(`/auth/user/${config.userId}`, {
			headers: { Authorization: `Bearer ${config.authToken}` },
		});
	}

	/**
	 * ************************************
	 * Forgot password request
	 * ************************************
	 *
	 * @async
	 * @param {Object} form - The form data for the password recovery request.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async forgotPassword(form) {
		return this.axiosInstance.post(`/auth/recovery/request`, form);
	}

	/**
	 * ************************************
	 * Validates a recovery token
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.recoveryToken - The recovery token to be validated.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async validateRecoveryToken(config) {
		return this.axiosInstance.post("/auth/recovery/validate", {
			recoveryToken: config.recoveryToken,
		});
	}

	/**
	 * ************************************
	 * Requests password recovery
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.recoveryToken - The token for recovery request.
	 * @param {Object} config.form - The form data for the password recovery request.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async setNewPassword(config) {
		return this.axiosInstance.post("/auth/recovery/reset", {
			...config.form,
			recoveryToken: config.recoveryToken,
		});
	}

	/**
	 * ************************************
	 * Checks if an admin user exists
	 * ************************************
	 *
	 * @async
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async doesSuperAdminExist() {
		return this.axiosInstance.get("/auth/users/superadmin");
	}

	/**
	 * ************************************
	 * Get all users
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async getAllUsers(config) {
		return this.axiosInstance.get("/auth/users", {
			headers: { Authorization: `Bearer ${config.authToken}` },
		});
	}

	/**
	 * ************************************
	 * Requests an invitation token
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.email - The email of the user to be invited.
	 * @param {string} config.role - The role of the user to be invited.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async requestInvitationToken(config) {
		return this.axiosInstance.post(
			`/invite`,
			{ email: config.email, role: config.role },
			{
				headers: { Authorization: `Bearer ${config.authToken}` },
			}
		);
	}

	/**
	 * ************************************
	 * Verifies an invitation token
	 * ************************************
	 *
	 * @async
	 * @param {string} token - The invitation token to be verified.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */
	async verifyInvitationToken(token) {
		return this.axiosInstance.post(`/invite/verify`, {
			token,
		});
	}

	/**
	 * ************************************
	 * Get all checks for a given monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.monitorId - The ID of the monitor.
	 * @param {string} config.sortOrder - The order in which to sort the checks.
	 * @param {number} config.limit - The maximum number of checks to retrieve.
	 * @param {string} config.dateRange - The range of dates for which to retrieve checks.
	 * @param {string} config.filter - The filter to apply to the checks.
	 * @param {number} config.page - The page number to retrieve in a paginated list.
	 * @param {number} config.rowsPerPage - The number of rows per page in a paginated list.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */

	async getChecksByMonitor(config) {
		const params = new URLSearchParams();
		if (config.sortOrder) params.append("sortOrder", config.sortOrder);
		if (config.limit) params.append("limit", config.limit);
		if (config.dateRange) params.append("dateRange", config.dateRange);
		if (config.filter) params.append("filter", config.filter);
		if (config.page) params.append("page", config.page);
		if (config.rowsPerPage) params.append("rowsPerPage", config.rowsPerPage);

		return this.axiosInstance.get(`/checks/${config.monitorId}?${params.toString()}`, {
			headers: { Authorization: `Bearer ${config.authToken}` },
		});
	}

	/**
	 * ************************************
	 * Get all checks for a given user
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} config.userId - The ID of the user.
	 * @param {string} config.sortOrder - The order in which to sort the checks.
	 * @param {number} config.limit - The maximum number of checks to retrieve.
	 * @param {string} config.dateRange - The range of dates for which to retrieve checks.
	 * @param {string} config.filter - The filter to apply to the checks.
	 * @param {number} config.page - The page number to retrieve in a paginated list.
	 * @param {number} config.rowsPerPage - The number of rows per page in a paginated list.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async getChecksByTeam(config) {
		const params = new URLSearchParams();
		if (config.sortOrder) params.append("sortOrder", config.sortOrder);
		if (config.limit) params.append("limit", config.limit);
		if (config.dateRange) params.append("dateRange", config.dateRange);
		if (config.filter) params.append("filter", config.filter);
		if (config.page) params.append("page", config.page);
		if (config.rowsPerPage) params.append("rowsPerPage", config.rowsPerPage);
		return this.axiosInstance.get(`/checks/team/${config.teamId}?${params.toString()}`, {
			headers: { Authorization: `Bearer ${config.authToken}` },
		});
	}

	/**
	 * ************************************
	 * Get all checks for a given user
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {number} config.ttl - TTL for checks
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async updateChecksTTL(config) {
		return this.axiosInstance.put(
			`/checks/team/ttl`,
			{ ttl: config.ttl },
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * ************************************
	 * Get app settings
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */

	async getAppSettings(config) {
		return this.axiosInstance.get("/settings", {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 *
	 * ************************************
	 * Create a new monitor
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {Object} config.settings - The monitor object to be sent in the request body.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 */
	async updateAppSettings(config) {
		return this.axiosInstance.put(`/settings`, config.settings, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Creates a maintenance window
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {Object} config.maintenanceWindow - The maintenance window object to be sent in the request body.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */

	async createMaintenanceWindow(config) {
		return this.axiosInstance.post(`/maintenance-window`, config.maintenanceWindow, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Edits a maintenance window
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {Object} config.maintenanceWindowId - The maintenance window id.
	 * @param {Object} config.maintenanceWindow - The maintenance window object to be sent in the request body.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */

	async editMaintenanceWindow(config) {
		return this.axiosInstance.put(
			`/maintenance-window/${config.maintenanceWindowId}`,
			config.maintenanceWindow,
			{
				headers: {
					Authorization: `Bearer ${config.authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * ************************************
	 * Get maintenance window by id
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} [config.maintenanceWindowId] - The id of the maintenance window to delete.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */

	async getMaintenanceWindowById(config) {
		const { authToken, maintenanceWindowId } = config;
		return this.axiosInstance.get(`/maintenance-window/${maintenanceWindowId}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Get maintenance windows by teamId
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} [config.active] - The status of the maintenance windows to retrieve.
	 * @param {number} [config.page] - The page number for pagination.
	 * @param {number} [config.rowsPerPage] - The number of rows per page for pagination.
	 * @param {string} [config.field] - The field to sort by.
	 * @param {string} [config.order] - The order in which to sort the field.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */

	async getMaintenanceWindowsByTeamId(config) {
		const { authToken, active, page, rowsPerPage, field, order } = config;
		const params = new URLSearchParams();

		if (active) params.append("status", active);
		if (page) params.append("page", page);
		if (rowsPerPage) params.append("rowsPerPage", rowsPerPage);
		if (field) params.append("field", field);
		if (order) params.append("order", order);

		return this.axiosInstance.get(`/maintenance-window/team?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		});
	}
	/**
	 * ************************************
	 * Delete maintenance window by id
	 * ************************************
	 *
	 * @async
	 * @param {Object} config - The configuration object.
	 * @param {string} config.authToken - The authorization token to be used in the request header.
	 * @param {string} [config.maintenanceWindowId] - The id of the maintenance window to delete.
	 * @returns {Promise<AxiosResponse>} The response from the axios POST request.
	 *
	 */

	async deleteMaintenanceWindow(config) {
		const { authToken, maintenanceWindowId } = config;
		return this.axiosInstance.delete(`/maintenance-window/${maintenanceWindowId}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * ************************************
	 * Fetcher github latest release version
	 * ************************************
	 *
	 * @async
	 * @returns {Promise<AxiosResponse>} The response from the axios GET request.
	 *
	 */
	async fetchGithubLatestRelease() {
		return this.axiosInstance.get(
			"https://api.github.com/repos/bluewave-labs/bluewave-uptime/releases/latest"
		);
	}

	subscribeToDistributedUptimeMonitors(config) {
		const {
			authToken,
			teamId,
			onUpdate,
			onError,
			onOpen,
			limit,
			types,
			page,
			rowsPerPage,
			filter,
			field,
			order,
		} = config;

		const params = new URLSearchParams();

		if (limit) params.append("limit", limit);
		if (types) {
			types.forEach((type) => {
				params.append("type", type);
			});
		}
		if (page) params.append("page", page);
		if (rowsPerPage) params.append("rowsPerPage", rowsPerPage);
		if (filter) params.append("filter", filter);
		if (field) params.append("field", field);
		if (order) params.append("order", order);

		if (this.eventSource) {
			this.eventSource.close();
		}

		const url = `${this.axiosInstance.defaults.baseURL}/distributed-uptime/monitors/${teamId}?${params.toString()}`;
		this.eventSource = new EventSource(url, {
			headers: { Authorization: `Bearer ${authToken}` },
		});

		this.eventSource.onopen = () => {
			onOpen?.();
		};

		this.eventSource.addEventListener("open", (e) => {
			console.log("getDistributedUptimeMonitors connection opened:");
		});

		this.eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			onUpdate(data);
		};

		this.eventSource.onerror = (error) => {
			console.error("Monitor stream error:", error);
			onError?.();
			this.eventSource.close();
		};

		// Returns a cleanup function
		return () => {
			if (this.eventSource) {
				this.eventSource.close();
				this.eventSource = null;
			}
			return () => {
				console.log("Nothing to cleanup");
			};
		};
	}

	subscribeToDistributedUptimeDetails(config) {
		const params = new URLSearchParams();
		const { authToken, monitorId, onUpdate, onOpen, onError, dateRange, normalize } =
			config;
		if (dateRange) params.append("dateRange", dateRange);
		if (normalize) params.append("normalize", normalize);

		const url = `${this.axiosInstance.defaults.baseURL}/distributed-uptime/monitors/details/${monitorId}?${params.toString()}`;
		this.eventSource = new EventSource(url, {
			headers: { Authorization: `Bearer ${authToken}` },
		});

		this.eventSource.onopen = (e) => {
			onOpen?.();
		};

		this.eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			onUpdate(data);
		};

		this.eventSource.onerror = (error) => {
			console.error("Monitor stream error:", error);
			onError?.();
			this.eventSource.close();
		};
	}
}

export default NetworkService;

let networkService;

export const setNetworkService = (service) => {
	networkService = service;
};
export { networkService };
