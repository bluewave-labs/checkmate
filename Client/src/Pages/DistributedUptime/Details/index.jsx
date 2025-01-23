//Components
import DistributedUptimeMap from "../components/DistributedUptimeMap";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Stack, Typography, Box, Button, ButtonGroup } from "@mui/material";
import { ChartBox } from "../../Uptime/Details/styled";
import IconBox from "../../../Components/IconBox";
import ResponseTimeIcon from "../../../assets/icons/response-time-icon.svg?react";
import DeviceTicker from "../components/DeviceTicker";
import DistributedUptimeResponseChart from "../components/DistributedUptimeResponseChart";
import UptLogo from "../../../assets/icons/upt_logo.png";
import LastUpdate from "../components/LastUpdate";
import NextExpectedCheck from "../components/NextExpectedCheck";
import JupiterLogoLight from "../../../assets/Images/jupiter_logo_banner_light.svg?react";
import JupiterLogoDark from "../../../assets/Images/jupiter_logo_banner_dark.svg?react";
import SolanaLogoBannerLight from "../../../assets/Images/solana_logo_banner_light.svg?react";
import SolanaLogoBannerDark from "../../../assets/Images/solana_logo_banner_dark.svg?react";
import Footer from "../components/Footer";
//Utils
import { networkService } from "../../../main";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

//Constants
const BASE_BOX_PADDING_VERTICAL = 8;
const BASE_BOX_PADDING_HORIZONTAL = 8;
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

function getRandomDevice() {
	const manufacturers = {
		Apple: ["iPhone 15 Pro Max", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13"],
		Samsung: [
			"Galaxy S23 Ultra",
			"Galaxy S23+",
			"Galaxy S23",
			"Galaxy Z Fold5",
			"Galaxy Z Flip5",
		],
		Google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7", "Pixel 6a"],
		OnePlus: [
			"OnePlus 11",
			"OnePlus 10T",
			"OnePlus Nord 3",
			"OnePlus 10 Pro",
			"OnePlus Nord 2T",
		],
		Xiaomi: ["13 Pro", "13", "Redmi Note 12", "POCO F5", "Redmi 12"],
		Huawei: ["P60 Pro", "Mate X3", "Nova 11", "P50 Pro", "Mate 50"],
		Sony: ["Xperia 1 V", "Xperia 5 V", "Xperia 10 V", "Xperia Pro-I", "Xperia 1 IV"],
		Motorola: ["Edge 40 Pro", "Edge 40", "G84", "G54", "Razr 40 Ultra"],
		ASUS: [
			"ROG Phone 7",
			"Zenfone 10",
			"ROG Phone 6",
			"Zenfone 9",
			"ROG Phone 7 Ultimate",
		],
	};

	const manufacturerNames = Object.keys(manufacturers);
	const randomManufacturer =
		manufacturerNames[Math.floor(Math.random() * manufacturerNames.length)];

	const models = manufacturers[randomManufacturer];
	const randomModel = models[Math.floor(Math.random() * models.length)];

	return {
		manufacturer: randomManufacturer,
		model: randomModel,
	};
}

export const StatBox = ({ heading, value, img, altTxt }) => {
	const theme = useTheme();
	return (
		<Stack
			direction="row"
			width={"25%"}
			justifyContent="center"
			sx={{
				padding: `${theme.spacing(BASE_BOX_PADDING_VERTICAL)} ${theme.spacing(BASE_BOX_PADDING_HORIZONTAL)}`,
				backgroundColor: theme.palette.background.main,
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.border.light,
			}}
		>
			{img && (
				<img
					style={{ marginRight: theme.spacing(8) }}
					height={30}
					width={30}
					src={img}
					alt={altTxt}
				/>
			)}
			<Stack direction="column">
				<Typography variant="h2">{heading}</Typography>
				<Typography>{value}</Typography>
			</Stack>
		</Stack>
	);
};

const DistributedUptimeDetails = () => {
	// Redux State
	const { authToken } = useSelector((state) => state.auth);
	const { mode } = useSelector((state) => state.ui);

	// Local State
	// const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
	// const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const [connectionStatus, setConnectionStatus] = useState("down");
	const [lastUpdateTrigger, setLastUpdateTrigger] = useState(Date.now());
	const [dateRange, setDateRange] = useState("day");
	const [monitor, setMonitor] = useState(null);
	const [devices, setDevices] = useState([]);

	// Refs
	const prevDateRangeRef = useRef(dateRange);

	// Utils
	const theme = useTheme();
	const { monitorId } = useParams();

	// Constants
	const BREADCRUMBS = [
		{ name: "Distributed Uptime", path: "/distributed-uptime" },
		{ name: "Details", path: `/distributed-uptime/${monitorId}` },
	];

	useEffect(() => {
		const hasDateRangeChanged = prevDateRangeRef.current !== dateRange;
		prevDateRangeRef.current = dateRange; // Update the ref to the current dateRange

		if (!hasDateRangeChanged) {
			setDevices(Array.from({ length: 5 }, getRandomDevice));
		}
	}, [dateRange]);

	const connectToService = useCallback(() => {
		return networkService.subscribeToDistributedUptimeDetails({
			authToken,
			monitorId,
			dateRange: dateRange,
			normalize: true,
			onUpdate: (data) => {
				setLastUpdateTrigger(Date.now());
				const latestChecksWithDevice = data?.monitor?.latestChecks.map((check, idx) => {
					check.device = devices[idx];
					return check;
				});
				const monitorWithDevice = {
					...data.monitor,
					latestChecks: latestChecksWithDevice,
				};
				setMonitor(monitorWithDevice);
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
	}, [authToken, monitorId, dateRange, retryCount, devices]);

	useEffect(() => {
		const devices = Array.from({ length: 5 }, getRandomDevice);
		const cleanup = connectToService(devices);
		return cleanup;
	}, [connectToService]);

	return (
		monitor && (
			<Stack
				direction="column"
				gap={theme.spacing(8)}
			>
				<Breadcrumbs list={BREADCRUMBS} />
				{monitor?.url !== "https://jup.ag/" &&
					monitor?.url !== "https://explorer.solana.com/" && (
						<Box>
							<Typography
								component="h1"
								variant="h1"
							>
								{monitor.name}
							</Typography>
						</Box>
					)}
				<Stack
					direction="row"
					alignItems="center"
					gap={theme.spacing(8)}
				>
					{/* Jupiter */}
					{monitor?.url === "https://jup.ag/" && (
						<Box>{mode === "dark" ? <JupiterLogoDark /> : <JupiterLogoLight />}</Box>
					)}
					{/* Solana */}
					{monitor?.url === "https://explorer.solana.com/" && (
						<Box>
							{mode === "dark" ? (
								<SolanaLogoBannerDark
									height={20}
									width={"auto"}
								/>
							) : (
								<SolanaLogoBannerLight
									height={20}
									width={"auto"}
								/>
							)}
						</Box>
					)}

					<Typography variant="h2">
						Distributed Uptime Monitoring powered by DePIN
					</Typography>
				</Stack>
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
					<StatBox
						heading={"Last check"}
						value={
							<LastUpdate
								lastUpdateTime={monitor?.timeSinceLastCheck ?? 0}
								suffix={"seconds ago"}
							/>
						}
					/>
					<StatBox
						heading="Last server push"
						value={
							<LastUpdate
								suffix={"seconds ago"}
								lastUpdateTime={0}
								trigger={lastUpdateTrigger}
							/>
						}
					/>

					<StatBox
						heading="UPT Burned"
						value={monitor?.totalUptBurnt ?? 0}
						img={UptLogo}
						altTxt="Upt Logo"
					/>
				</Stack>
				<Box sx={{ width: "100%" }}>
					<NextExpectedCheck
						lastUpdateTime={monitor?.timeSinceLastCheck ?? 0}
						interval={monitor?.interval ?? 0}
						trigger={lastUpdateTrigger}
					/>
				</Box>
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
			</Stack>
		)
	);
};

export default DistributedUptimeDetails;
