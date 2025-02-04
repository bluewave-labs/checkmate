import { Navigate, Route, Routes as LibRoutes } from "react-router";
import HomeLayout from "../Components/Layouts/HomeLayout";
import NotFound from "../Pages/NotFound";

// Auth
import AuthLogin from "../Pages/Auth/Login/Login";
import AuthRegister from "../Pages/Auth/Register/Register";
import AuthForgotPassword from "../Pages/Auth/ForgotPassword";
import AuthCheckEmail from "../Pages/Auth/CheckEmail";
import AuthSetNewPassword from "../Pages/Auth/SetNewPassword";
import AuthNewPasswordConfirmed from "../Pages/Auth/NewPasswordConfirmed";

// Uptime
import Uptime from "../Pages/Uptime/Monitors";
import UptimeDetails from "../Pages/Uptime/Details";
import UptimeCreate from "../Pages/Uptime/Create";
import UptimeConfigure from "../Pages/Uptime/Configure";

// PageSpeed
import PageSpeed from "../Pages/PageSpeed/Monitors";
import PageSpeedCreate from "../Pages/PageSpeed/Create";
import PageSpeedDetails from "../Pages/PageSpeed/Details";
import PageSpeedConfigure from "../Pages/PageSpeed/Configure";

// Infrastructure
import Infrastructure from "../Pages/Infrastructure/Monitors";
import InfrastructureCreate from "../Pages/Infrastructure/Create";
import InfrastructureDetails from "../Pages/Infrastructure/Details";

import Incidents from "../Pages/Incidents";

//Status pages
import CreateStatus from "../Pages/StatusPage/Create";
import PublicStatus from "../Pages/StatusPage/PublicStatus";

import Integrations from "../Pages/Integrations";

// Settings
import Account from "../Pages/Account";
import Settings from "../Pages/Settings";

import Maintenance from "../Pages/Maintenance";

import ProtectedRoute from "../Components/ProtectedRoute";
import CreateNewMaintenanceWindow from "../Pages/Maintenance/CreateMaintenance";
import withAdminCheck from "../Components/HOC/withAdminCheck";

const Routes = () => {
	const AdminCheckedRegister = withAdminCheck(AuthRegister);
	return (
		<LibRoutes>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<HomeLayout />
					</ProtectedRoute>
				}
			>
				<Route
					path="/"
					element={<Navigate to="/uptime" />}
				/>
				<Route
					path="/uptime"
					element={<Uptime />}
				/>

				<Route
					path="/uptime/create/:monitorId?"
					element={<UptimeCreate />}
				/>
				<Route
					path="/uptime/:monitorId/"
					element={<UptimeDetails />}
				/>
				<Route
					path="/uptime/configure/:monitorId/"
					element={<UptimeConfigure />}
				/>
				<Route
					path="pagespeed"
					element={<PageSpeed />}
				/>
				<Route
					path="pagespeed/create"
					element={<PageSpeedCreate />}
				/>
				<Route
					path="pagespeed/:monitorId"
					element={<PageSpeedDetails />}
				/>
				<Route
					path="pagespeed/configure/:monitorId"
					element={<PageSpeedConfigure />}
				/>
				<Route
					path="infrastructure"
					element={<Infrastructure />}
				/>
				<Route
					path="infrastructure/create"
					element={<InfrastructureCreate />}
				/>
				<Route
					path="infrastructure/:monitorId"
					element={<InfrastructureDetails />}
				/>
				<Route
					path="incidents/:monitorId?"
					element={<Incidents />}
				/>

				<Route
					path="status"
					element={<PublicStatus />}
				/>

				<Route
					path="status/create"
					element={<CreateStatus />}
				/>

				<Route
					path="integrations"
					element={<Integrations />}
				/>
				<Route
					path="maintenance"
					element={<Maintenance />}
				/>
				<Route
					path="/maintenance/create/:maintenanceWindowId?"
					element={<CreateNewMaintenanceWindow />}
				/>
				<Route
					path="settings"
					element={<Settings />}
				/>
				<Route
					path="account/profile"
					element={<Account open={"profile"} />}
				/>
				<Route
					path="account/password"
					element={<Account open={"password"} />}
				/>
				<Route
					path="account/team"
					element={<Account open={"team"} />}
				/>
			</Route>

			<Route
				path="/login"
				element={<AuthLogin />}
			/>

			<Route
				path="/register"
				element={<AdminCheckedRegister />}
			/>

			<Route
				exact
				path="/register/:token"
				element={<AuthRegister />}
			/>

			<Route
				path="/forgot-password"
				element={<AuthForgotPassword />}
			/>
			<Route
				path="/check-email"
				element={<AuthCheckEmail />}
			/>
			<Route
				path="/set-new-password/:token"
				element={<AuthSetNewPassword />}
			/>
			<Route
				path="/new-password-confirmed"
				element={<AuthNewPasswordConfirmed />}
			/>
			<Route
				path="/status/public"
				element={<PublicStatus />}
			/>

			<Route
				path="*"
				element={<NotFound />}
			/>
		</LibRoutes>
	);
};

export { Routes };
