//Components
import DistributedUptimeMap from "../Details/Components/DistributedUptimeMap";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Stack, Typography } from "@mui/material";
import DeviceTicker from "../Details/Components/DeviceTicker";
import DistributedUptimeResponseChart from "../Details/Components/DistributedUptimeResponseChart";
import NextExpectedCheck from "../Details/Components/NextExpectedCheck";
import Footer from "../Details/Components/Footer";
import StatBoxes from "../Details/Components/StatBoxes";
import ControlsHeader from "../../StatusPage/Status/Components/ControlsHeader";
import MonitorTimeFrameHeader from "../../../Components/MonitorTimeFrameHeader";
import GenericFallback from "../../../Components/GenericFallback";
import Dialog from "../../../Components/Dialog";
//Utils
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useSubscribeToDetails } from "../Details/Hooks/useSubscribeToDetails";
import { useStatusPageFetchByUrl } from "./Hooks/useStatusPageFetchByUrl";
import { useStatusPageDelete } from "../../StatusPage/Status/Hooks/useStatusPageDelete";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
const DistributedUptimeStatus = () => {
	const { url } = useParams();
	const location = useLocation();
	const isPublic = location.pathname.startsWith("/distributed-uptime/status/public");

	// Local State
	const [dateRange, setDateRange] = useState("day");
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	// Utils
	const theme = useTheme();
	const navigate = useNavigate();
	const [statusPageIsLoading, statusPageNetworkError, statusPage, monitorId] =
		useStatusPageFetchByUrl({
			url,
		});

	const [isLoading, networkError, connectionStatus, monitor, lastUpdateTrigger] =
		useSubscribeToDetails({ monitorId, dateRange });

	const [deleteStatusPage, isDeleting] = useStatusPageDelete(() => {
		navigate("/distributed-uptime");
	}, url);
	// Constants
	const BREADCRUMBS = [
		{ name: "Distributed Uptime", path: "/distributed-uptime" },
		{ name: "status", path: `` },
	];

	let sx = {};
	if (isPublic) {
		sx = {
			paddingTop: "10vh",
			paddingRight: "10vw",
			paddingBottom: "10vh",
			paddingLeft: "10vw",
		};
	}

	if (networkError) {
		return (
			<GenericFallback>
				<Typography
					variant="h1"
					marginY={theme.spacing(4)}
					color={theme.palette.primary.contrastTextTertiary}
				>
					Network error
				</Typography>
				<Typography>Please check your connection</Typography>
			</GenericFallback>
		);
	}

	if (typeof monitor === "undefined" || monitor.totalChecks === 0) {
		return (
			<Stack gap={theme.spacing(10)}>
				<Breadcrumbs list={BREADCRUMBS} />
				<GenericFallback>
					<Typography>There is no check history for this monitor yet.</Typography>
				</GenericFallback>
			</Stack>
		);
	}

	return (
		<Stack
			direction="column"
			gap={theme.spacing(10)}
			sx={sx}
		>
			{!isPublic && <Breadcrumbs list={BREADCRUMBS} />}
			<ControlsHeader
				statusPage={statusPage}
				isDeleting={isDeleting}
				isDeleteOpen={isDeleteOpen}
				setIsDeleteOpen={setIsDeleteOpen}
			/>
			<StatBoxes
				monitor={monitor}
				lastUpdateTrigger={lastUpdateTrigger}
			/>
			<NextExpectedCheck
				lastUpdateTime={monitor?.timeSinceLastCheck ?? 0}
				interval={monitor?.interval ?? 0}
				trigger={lastUpdateTrigger}
			/>
			<MonitorTimeFrameHeader
				dateRange={dateRange}
				setDateRange={setDateRange}
			/>
			<DistributedUptimeResponseChart checks={monitor?.groupedChecks ?? []} />
			<Stack
				direction="row"
				gap={theme.spacing(8)}
			>
				<DistributedUptimeMap
					checks={monitor?.groupedMapChecks ?? []}
					height={"100%"}
					width={"100%"}
				/>
				<DeviceTicker
					width={"25vw"}
					data={monitor?.latestChecks ?? []}
					connectionStatus={connectionStatus}
				/>
			</Stack>
			<Footer />
			<Dialog
				// open={isOpen.deleteStats}
				title="Do you want to delete this status page?"
				onConfirm={() => {
					deleteStatusPage();
					setIsDeleteOpen(false);
				}}
				onCancel={() => {
					setIsDeleteOpen(false);
				}}
				open={isDeleteOpen}
				confirmationButtonLabel="Yes, delete status page"
				description="Once deleted, your status page cannot be retrieved."
				isLoading={isDeleting || isLoading}
			/>
		</Stack>
	);
};

export default DistributedUptimeStatus;
