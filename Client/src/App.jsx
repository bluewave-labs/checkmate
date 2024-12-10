import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register/Register";
import Account from "./Pages/Account";
import Uptime from "./Pages/Uptime/Home";
import CreateMonitor from "./Pages/Uptime/CreateUptime";
import CreateInfrastructureMonitor from "./Pages/Infrastructure/CreateMonitor";
import Incidents from "./Pages/Incidents";
import Status from "./Pages/Status";
import Integrations from "./Pages/Integrations";
import Settings from "./Pages/Settings";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import CheckEmail from "./Pages/Auth/CheckEmail";
import SetNewPassword from "./Pages/Auth/SetNewPassword";
import NewPasswordConfirmed from "./Pages/Auth/NewPasswordConfirmed";
import ProtectedRoute from "./Components/ProtectedRoute";
import UptimeDetails from "./Pages/Uptime/Details";
import AdvancedSettings from "./Pages/AdvancedSettings";
import Maintenance from "./Pages/Maintenance";
import Configure from "./Pages/Uptime/Configure";
import PageSpeed from "./Pages/PageSpeed";
import CreatePageSpeed from "./Pages/PageSpeed/CreatePageSpeed";
import CreateNewMaintenanceWindow from "./Pages/Maintenance/CreateMaintenance";
import PageSpeedDetails from "./Pages/PageSpeed/Details";
import PageSpeedConfigure from "./Pages/PageSpeed/Configure";
import HomeLayout from "./Components/Layouts/HomeLayout";
import withAdminCheck from "./Components/HOC/withAdminCheck";
import withAdminProp from "./Components/HOC/withAdminProp";
import { ThemeProvider } from "@emotion/react";
import lightTheme from "./Utils/Theme/lightTheme";
import darkTheme from "./Utils/Theme/darkTheme";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { getAppSettings } from "./Features/Settings/settingsSlice";
import { logger } from "./Utils/Logger"; // Import the logger
import { networkService } from "./main";
import { Infrastructure } from "./Pages/Infrastructure";
import InfrastructureDetails from "./Pages/Infrastructure/Details";
function App() {
	const AdminCheckedRegister = withAdminCheck(Register);
	const UptimeWithAdminProp = withAdminProp(Uptime);
	const UptimeDetailsWithAdminProp = withAdminProp(UptimeDetails);
	const PageSpeedWithAdminProp = withAdminProp(PageSpeed);
	const PageSpeedDetailsWithAdminProp = withAdminProp(PageSpeedDetails);
	const MaintenanceWithAdminProp = withAdminProp(Maintenance);
	const SettingsWithAdminProp = withAdminProp(Settings);
	const AdvancedSettingsWithAdminProp = withAdminProp(AdvancedSettings);
	const InfrastructureDetailsWithAdminProp = withAdminProp(InfrastructureDetails);
	const mode = useSelector((state) => state.ui.mode);
	const { authToken } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	useEffect(() => {
		if (authToken) {
			dispatch(getAppSettings({ authToken }));
		}
	}, [dispatch, authToken]);

	// Cleanup
	useEffect(() => {
		return () => {
			logger.cleanup();
			networkService.cleanup();
		};
	}, []);

	return (
		/* Extract Themeprovider, baseline and global styles to Styles */
		<ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
			<CssBaseline />
			<GlobalStyles
				styles={({ palette }) => {
					return {
						body: {
							backgroundImage: `radial-gradient(circle, ${palette.gradient.color1}, ${palette.gradient.color2}, ${palette.gradient.color3}, ${palette.gradient.color4}, ${palette.gradient.color5})`,
						},
					};
				}}
			/>
			{/* Extract Routes to Routes */}
			<Routes>
				<Route
					exact
					path="/"
					element={<HomeLayout />}
				>
					<Route
						exact
						path="/"
						element={<Navigate to="/uptime" />}
					/>
					<Route
						path="/uptime"
						element={<ProtectedRoute Component={UptimeWithAdminProp} />}
					/>
					<Route
						path="/uptime/create/:monitorId?"
						element={<ProtectedRoute Component={CreateMonitor} />}
					/>
					<Route
						path="/uptime/:monitorId/"
						element={<ProtectedRoute Component={UptimeDetailsWithAdminProp} />}
					/>
					<Route
						path="/uptime/configure/:monitorId/"
						element={<ProtectedRoute Component={Configure} />}
					/>
					<Route
						path="pagespeed"
						element={<ProtectedRoute Component={PageSpeedWithAdminProp} />}
					/>
					<Route
						path="pagespeed/create"
						element={<ProtectedRoute Component={CreatePageSpeed} />}
					/>
					<Route
						path="pagespeed/:monitorId"
						element={<ProtectedRoute Component={PageSpeedDetailsWithAdminProp} />}
					/>
					<Route
						path="pagespeed/configure/:monitorId"
						element={<ProtectedRoute Component={PageSpeedConfigure} />}
					/>
					<Route
						path="infrastructure"
						element={<ProtectedRoute Component={Infrastructure} />}
					/>
					<Route
						path="infrastructure/create"
						element={<ProtectedRoute Component={CreateInfrastructureMonitor} />}
					/>
					<Route
						path="infrastructure/:monitorId"
						element={<ProtectedRoute Component={InfrastructureDetailsWithAdminProp} />}
					/>

					<Route
						path="incidents/:monitorId?"
						element={<ProtectedRoute Component={Incidents} />}
					/>

					<Route
						path="status"
						element={<ProtectedRoute Component={Status} />}
					/>
					<Route
						path="integrations"
						element={<ProtectedRoute Component={Integrations} />}
					/>
					<Route
						path="maintenance"
						element={<ProtectedRoute Component={MaintenanceWithAdminProp} />}
					/>
					<Route
						path="/maintenance/create/:maintenanceWindowId?"
						element={<CreateNewMaintenanceWindow />}
					/>
					<Route
						path="settings"
						element={<ProtectedRoute Component={SettingsWithAdminProp} />}
					/>
					<Route
						path="advanced-settings"
						element={<ProtectedRoute Component={AdvancedSettingsWithAdminProp} />}
					/>
					<Route
						path="account/profile"
						element={
							<ProtectedRoute
								Component={Account}
								open="profile"
							/>
						}
					/>
					<Route
						path="account/password"
						element={
							<ProtectedRoute
								Component={Account}
								open="password"
							/>
						}
					/>
					<Route
						path="account/team"
						element={
							<ProtectedRoute
								Component={Account}
								open="team"
							/>
						}
					/>
				</Route>

				<Route
					exact
					path="/login"
					element={<Login />}
				/>

				<Route
					exact
					path="/register"
					element={<AdminCheckedRegister />}
				/>

				<Route
					exact
					path="/register/:token"
					element={<Register />}
				/>

				<Route
					path="*"
					element={<NotFound />}
				/>

				<Route
					path="/forgot-password"
					element={<ForgotPassword />}
				/>
				<Route
					path="/check-email"
					element={<CheckEmail />}
				/>
				<Route
					path="/set-new-password/:token"
					element={<SetNewPassword />}
				/>
				<Route
					path="/new-password-confirmed"
					element={<NewPasswordConfirmed />}
				/>
			</Routes>
			<ToastContainer />
		</ThemeProvider>
	);
}

export default App;
