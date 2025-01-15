//Components
import DistributedUptimeMap from "../components/DistributedUptimeMap";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Stack, Typography, Box } from "@mui/material";
import { ChartBox } from "../../Uptime/Details/styled";
import IconBox from "../../../Components/IconBox";
import ResponseTimeIcon from "../../../assets/icons/response-time-icon.svg?react";
import DeviceTicker from "../components/DeviceTicker";
import DistributedUptimeResponseChart from "../components/DistributedUptimeResponseChart";
import UptimeIcon from "../../../assets/icons/uptime-icon.svg?react";

//Utils
import { networkService } from "../../../main";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//Constants
const BASE_BOX_PADDING_VERTICAL = 16;
const BASE_BOX_PADDING_HORIZONTAL = 8;

const StatBox = ({ heading, value }) => {
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
			<Typography variant="h2">{heading}</Typography>
			<Typography>{value}</Typography>
		</Box>
	);
};

const DistributedUptimeDetails = () => {
	// Redux State
	const { authToken } = useSelector((state) => state.auth);

	// Local State
	const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
	const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);
	const [dummyData, setDummyData] = useState({
		groupChecks: [],
	});
	const [dateRange, setDateRange] = useState("day");
	const [mapData, setMapData] = useState([]);

	// Utils
	const theme = useTheme();
	const { monitorId } = useParams();

	// Constants
	const BREADCRUMBS = [
		{ name: "Distributed Uptime", path: "/distributed-uptime" },
		{ name: "Details", path: `/distributed-uptime/${monitorId}` },
	];

	// useEffect(() => {
	// 	const generateRandomInterval = () =>
	// 		Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;

	// 	const intervalId = setInterval(() => {
	// 		setDummyData((prevData) => ({
	// 			groupChecks: [...prevData.groupChecks, generateDataPoint()],
	// 		}));
	// 		clearInterval(intervalId);
	// 		setInterval(() => {
	// 			setDummyData((prevData) => ({
	// 				groupChecks: [...prevData.groupChecks, generateDataPoint()],
	// 			}));
	// 		}, generateRandomInterval());
	// 	}, generateRandomInterval());

	// 	return () => clearInterval(intervalId);
	// }, []);

	const formatData = (groupedMapChecks) => {
		return groupedMapChecks.map((check) => {
			let responseColor;
			const { avgResponseTime, originalAvgResponseTime, city, lat, lng, totalChecks } =
				check;
			if (avgResponseTime <= 150) {
				responseColor = "#00FF00"; // Green
			} else if (avgResponseTime <= 250) {
				responseColor = "#FFFF00"; // Yellow
			} else {
				responseColor = "#FF0000"; // Red
			}

			return {
				_id: check._id.date,
				avgResponseTime,
				originalAvgResponseTime,
				totalChecks,
				location: {
					name: city,
					lat: lat,
					long: lng,
				},
				color: responseColor,
			};
		});
	};

	useEffect(() => {
		const cleanup = networkService.subscribeToDistributedUptimeDetails({
			authToken,
			monitorId,
			dateRange: dateRange,
			normalize: true,
			onUpdate: (data) => {
				console.log("updating");
				const formattedData = formatData(data.monitor.groupedMapChecks);
				setMapData(formattedData);
			},
		});
		return cleanup;
	}, [authToken, monitorId]);

	return (
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
					heading="Total Devices"
					value={"2,600,000"}
				/>
				<StatBox
					heading="Avg Response Time"
					value={
						dummyData.groupChecks.length > 0
							? `${Math.floor(
									dummyData.groupChecks.reduce(
										(sum, dataPoint) => sum + dataPoint.avgResponseTime,
										0
									) / dummyData.groupChecks.length
								)} ms`
							: "N/A"
					}
				/>
				<StatBox
					heading="Data retrieved from"
					value={`${dummyData.groupChecks.length} devices`}
				/>
				<StatBox
					heading="Tokens burnt"
					value={"15028"}
				/>
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
				<DistributedUptimeResponseChart checks={dummyData.groupChecks} />
			</ChartBox>
			<Stack
				direction="row"
				gap={theme.spacing(8)}
				height={"50vh"}
			>
				<DistributedUptimeMap
					checks={mapData}
					height={"100%"}
					width={"100%"}
				/>
				<DeviceTicker
					width={"25vw"}
					data={mapData}
				/>
			</Stack>
		</Stack>
	);
};

export default DistributedUptimeDetails;
