//Components
import DistributedUptimeMap from "../components/DistributedUptimeMap";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Stack, Typography, Box, Button, ButtonGroup } from "@mui/material";
import { ChartBox } from "../../Uptime/Details/styled";
import IconBox from "../../../Components/IconBox";
import ResponseTimeIcon from "../../../assets/icons/response-time-icon.svg?react";
import DeviceTicker from "../components/DeviceTicker";
import DistributedUptimeResponseChart from "../components/DistributedUptimeResponseChart";
import UptimeIcon from "../../../assets/icons/uptime-icon.svg?react";
import LastUpdate from "../components/LastUpdate";
import NextExpectedCheck from "../components/NextExpectedCheck";
//Utils
import { networkService } from "../../../main";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//Constants
const BASE_BOX_PADDING_VERTICAL = 16;
const BASE_BOX_PADDING_HORIZONTAL = 8;
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

const BaseBox = ({ children }) => {
	const theme = useTheme();

	return (
		<Box
			width={"25%"}
			sx={{
				padding: `${theme.spacing(BASE_BOX_PADDING_VERTICAL)} ${theme.spacing(BASE_BOX_PADDING_HORIZONTAL)}`,
				backgroundColor: theme.palette.background.main,
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.border.light,
			}}
		>
			{children}
		</Box>
	);
};
export const StatBox = ({ heading, value }) => {
	return (
		<BaseBox>
			<Typography variant="h2">{heading}</Typography>
			<Typography>{value}</Typography>
		</BaseBox>
	);
};

const DistributedUptimeDetails = () => {
	// Redux State
	const { authToken } = useSelector((state) => state.auth);

	// Local State
	// const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
	// const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const [connectionStatus, setConnectionStatus] = useState("down");
	const [lastUpdateTrigger, setLastUpdateTrigger] = useState(Date.now());
	const [dateRange, setDateRange] = useState("day");
	const [monitor, setMonitor] = useState(null);

	// Utils
	const theme = useTheme();
	const { monitorId } = useParams();

	// Constants
	const BREADCRUMBS = [
		{ name: "Distributed Uptime", path: "/distributed-uptime" },
		{ name: "Details", path: `/distributed-uptime/${monitorId}` },
	];

	useEffect(() => {
		const connectToService = () => {
			return networkService.subscribeToDistributedUptimeDetails({
				authToken,
				monitorId,
				dateRange: dateRange,
				normalize: true,
				onUpdate: (data) => {
					setLastUpdateTrigger(Date.now());
					setMonitor(data.monitor);
				},
				onOpen: () => {
					setConnectionStatus("up");
					setRetryCount(0); // Reset retry count on successful connection
				},
				onError: () => {
					setConnectionStatus("down");
					console.log("Error, attempting reconnect...");

					if (retryCount < MAX_RETRIES) {
						setTimeout(() => {
							setRetryCount((prev) => prev + 1);
							connectToService();
						}, RETRY_DELAY);
					} else {
						console.log("Max retries reached");
					}
				},
			});
		};

		const cleanup = connectToService();
		return cleanup;
	}, [authToken, monitorId, dateRange, retryCount]);

	return (
		monitor && (
			<Stack
				direction="column"
				gap={theme.spacing(8)}
			>
				<Breadcrumbs list={BREADCRUMBS} />
				<Stack
					direction="row"
					gap={theme.spacing(8)}
				>
					<StatBox
						heading="Avg Response Time"
						value={`${Math.floor(monitor?.avgResponseTime ?? 0)} ms`}
					/>
					<StatBox
						heading="Checking every"
						value={`${(monitor?.interval ?? 0) / 1000} seconds`}
					/>
					<LastUpdate
						heading={"Last check"}
						lastUpdateTime={monitor?.timeSinceLastCheck ?? 0}
						suffix={"seconds ago"}
					/>
					<LastUpdate
						key={Date.now}
						heading={"Last server push"}
						lastUpdateTime={0}
						trigger={lastUpdateTrigger}
						suffix={"seconds ago"}
					/>
				</Stack>
				<NextExpectedCheck
					lastUpdateTime={monitor?.timeSinceLastCheck ?? 0}
					interval={monitor?.interval ?? 0}
					trigger={lastUpdateTrigger}
				/>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-end"
					gap={theme.spacing(4)}
					mb={theme.spacing(8)}
				>
					<Typography variant="body2">
						Showing statistics for past{" "}
						{dateRange === "day"
							? "24 hours"
							: dateRange === "week"
								? "7 days"
								: "30 days"}
						.
					</Typography>
					<ButtonGroup sx={{ height: 32 }}>
						<Button
							variant="group"
							filled={(dateRange === "day").toString()}
							onClick={() => setDateRange("day")}
						>
							Day
						</Button>
						<Button
							variant="group"
							filled={(dateRange === "week").toString()}
							onClick={() => setDateRange("week")}
						>
							Week
						</Button>
						<Button
							variant="group"
							filled={(dateRange === "month").toString()}
							onClick={() => setDateRange("month")}
						>
							Month
						</Button>
					</ButtonGroup>
				</Stack>
				<ChartBox sx={{ padding: 0 }}>
					<Stack
						pt={theme.spacing(8)}
						pl={theme.spacing(8)}
					>
						<IconBox>
							<ResponseTimeIcon />
						</IconBox>
						<Typography component="h2">Response Times</Typography>
					</Stack>
					<DistributedUptimeResponseChart checks={monitor?.groupedChecks ?? []} />
				</ChartBox>
				<Stack
					direction="row"
					gap={theme.spacing(8)}
					height={"50vh"}
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
			</Stack>
		)
	);
};

export default DistributedUptimeDetails;
