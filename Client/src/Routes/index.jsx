import { Navigate, Route, Routes as LibRoutes } from "react-router";
import HomeLayout from "../Components/Layouts/HomeLayout";
import { Infrastructure } from "../Pages/Infrastructure";
import InfrastructureDetails from "../Pages/Infrastructure/Details";
import NotFound from "../Pages/NotFound";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import Account from "../Pages/Account";
import Monitors from "../Pages/Uptime/Home";
import CreateMonitor from "../Pages/Uptime/CreateUptime";
import CreateInfrastructureMonitor from "../Pages/Infrastructure/CreateMonitor";
import Incidents from "../Pages/Incidents";
import Status from "../Pages/Status";
import Integrations from "../Pages/Integrations";
import Settings from "../Pages/Settings";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import CheckEmail from "../Pages/Auth/CheckEmail";
import SetNewPassword from "../Pages/Auth/SetNewPassword";
import NewPasswordConfirmed from "../Pages/Auth/NewPasswordConfirmed";
import ProtectedRoute from "../Components/ProtectedRoute";
import Details from "../Pages/Uptime/Details";
import Maintenance from "../Pages/Maintenance";
import Configure from "../Pages/Uptime/Configure";
import PageSpeed from "../Pages/PageSpeed";
import CreatePageSpeed from "../Pages/PageSpeed/CreatePageSpeed";
import CreateNewMaintenanceWindow from "../Pages/Maintenance/CreateMaintenance";
import PageSpeedDetails from "../Pages/PageSpeed/Details";
import PageSpeedConfigure from "../Pages/PageSpeed/Configure";
import withAdminCheck from "../Components/HOC/withAdminCheck";

const Routes = () => {
	const AdminCheckedRegister = withAdminCheck(Register);
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
					element={<Monitors />}
				/>
				<Route
					path="/uptime/create/:monitorId?"
					element={<CreateMonitor />}
				/>
				<Route
					path="/uptime/:monitorId/"
					element={<Details />}
				/>
				<Route
					path="/uptime/configure/:monitorId/"
					element={<Configure />}
				/>
				<Route
					path="pagespeed"
					element={<PageSpeed />}
				/>
				<Route
					path="pagespeed/create"
					element={<CreatePageSpeed />}
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
					element={<CreateInfrastructureMonitor />}
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
					element={<Status />}
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
				element={<Login />}
			/>

			<Route
				path="/register"
				element={<AdminCheckedRegister />}
			/>

			<Route
				exact
				path="/register/:token"
				element={<Register />}
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

			<Route
				path="*"
				element={<NotFound />}
			/>
		</LibRoutes>
	);
};

export { Routes };
