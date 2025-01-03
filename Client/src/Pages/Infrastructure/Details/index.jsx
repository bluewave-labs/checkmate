import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Button, ButtonGroup, Stack, Box, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import CustomGauge from "../../../Components/Charts/CustomGauge";
import AreaChart from "../../../Components/Charts/AreaChart";
import { useSelector } from "react-redux";
import { networkService } from "../../../main";
import PulseDot from "../../../Components/Animated/PulseDot";
import useUtils from "../../Uptime/utils";
import { useNavigate } from "react-router-dom";
import Empty from "./empty";
import { logger } from "../../../Utils/Logger";
import { formatDurationRounded, formatDurationSplit } from "../../../Utils/timeUtils";
import {
	TzTick,
	PercentTick,
	InfrastructureTooltip,
	TemperatureTooltip,
} from "../../../Components/Charts/Utils/chartUtils";
import PropTypes from "prop-types";
import StatBox from "../../../Components/StatBox";

const BASE_BOX_PADDING_VERTICAL = 4;
const BASE_BOX_PADDING_HORIZONTAL = 8;
const TYPOGRAPHY_PADDING = 8;
/**
 * Converts bytes to gigabytes
 * @param {number} bytes - Number of bytes to convert
 * @returns {number} Converted value in gigabytes
 */
const formatBytes = (bytes, space = false) => {
	if (bytes === undefined || bytes === null)
		return (
			<>
				{0}
				{space ? " " : ""}
				<Typography component="span">GB</Typography>
			</>
		);
	if (typeof bytes !== "number")
		return (
			<>
				{0}
				{space ? " " : ""}
				<Typography component="span">GB</Typography>
			</>
		);
	if (bytes === 0)
		return (
			<>
				{0}
				{space ? " " : ""}
				<Typography component="span">GB</Typography>
			</>
		);

	const GB = bytes / (1024 * 1024 * 1024);
	const MB = bytes / (1024 * 1024);

	if (GB >= 1) {
		return (
			<>
				{Number(GB.toFixed(0))}
				{space ? " " : ""}
				<Typography component="span">GB</Typography>
			</>
		);
	} else {
		return (
			<>
				{Number(MB.toFixed(0))}
				<Typography component="span">MB</Typography>
			</>
		);
	}
};

/**
 * Converts a decimal value to a percentage
 *
 * @function decimalToPercentage
 * @param {number} value - Decimal value to convert
 * @returns {number} Percentage representation
 *
 * @example
 * decimalToPercentage(0.75)  // Returns 75
 * decimalToPercentage(null)  // Returns 0
 */
const decimalToPercentage = (value) => {
	if (value === null || value === undefined) return 0;
	return value * 100;
};

/**
 * Renders a base box with consistent styling
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render inside the box
 * @param {Object} props.sx - Additional styling for the box
 * @returns {React.ReactElement} Styled box component
 */
const BaseBox = ({ children, sx = {} }) => {
	const theme = useTheme();
	return (
		<Box
			sx={{
				height: "100%",
				padding: `${theme.spacing(BASE_BOX_PADDING_VERTICAL)} ${theme.spacing(BASE_BOX_PADDING_HORIZONTAL)}`,
				minWidth: 200,
				width: 225,
				backgroundColor: theme.palette.background.main,
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.border.light,
				...sx,
			}}
		>
			{children}
		</Box>
	);
};

BaseBox.propTypes = {
	children: PropTypes.node.isRequired,
	sx: PropTypes.object,
};

/**
 * Renders a gauge box with usage visualization
 * @param {Object} props - Component properties
 * @param {number} props.value - Percentage value for gauge
 * @param {string} props.heading - Box heading
 * @param {string} props.metricOne - First metric label
 * @param {string} props.valueOne - First metric value
 * @param {string} props.metricTwo - Second metric label
 * @param {string} props.valueTwo - Second metric value
 * @returns {React.ReactElement} Gauge box component
 */
const GaugeBox = ({ value, heading, metricOne, valueOne, metricTwo, valueTwo }) => {
	const theme = useTheme();

	return (
		<BaseBox>
			<Stack
				direction="column"
				gap={theme.spacing(2)}
				alignItems="center"
			>
				<CustomGauge
					progress={value}
					radius={100}
					color={theme.palette.primary.main}
				/>
				<Typography component="h2">{heading}</Typography>
				<Box
					sx={{
						width: "100%",
						borderTop: `1px solid ${theme.palette.border.light}`,
					}}
				>
					<Stack
						justifyContent={"space-between"}
						direction="row"
						gap={theme.spacing(2)}
					>
						<Typography>{metricOne}</Typography>
						<Typography>{valueOne}</Typography>
					</Stack>
					<Stack
						justifyContent={"space-between"}
						direction="row"
						gap={theme.spacing(2)}
					>
						<Typography>{metricTwo}</Typography>
						<Typography>{valueTwo}</Typography>
					</Stack>
				</Box>
			</Stack>
		</BaseBox>
	);
};

GaugeBox.propTypes = {
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	heading: PropTypes.string.isRequired,
	metricOne: PropTypes.string.isRequired,
	valueOne: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element])
		.isRequired,
	metricTwo: PropTypes.string.isRequired,
	valueTwo: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element])
		.isRequired,
};

/**
 * Renders the infrastructure details page
 * @returns {React.ReactElement} Infrastructure details page component
 */
const InfrastructureDetails = () => {
	const navigate = useNavigate();
	const theme = useTheme();
	const { monitorId } = useParams();
	const navList = [
		{ name: "infrastructure monitors", path: "/infrastructure" },
		{ name: "details", path: `/infrastructure/${monitorId}` },
	];
	const [monitor, setMonitor] = useState(null);
	const { authToken } = useSelector((state) => state.auth);
	const [dateRange, setDateRange] = useState("day");
	const { statusColor, statusStyles, determineState } = useUtils();
	// These calculations are needed because ResponsiveContainer
	// doesn't take padding of parent/siblings into account
	// when calculating height.
	const chartContainerHeight = 300;
	const totalChartContainerPadding =
		parseInt(theme.spacing(BASE_BOX_PADDING_VERTICAL), 10) * 2;
	const totalTypographyPadding = parseInt(theme.spacing(TYPOGRAPHY_PADDING), 10) * 2;
	const areaChartHeight =
		(chartContainerHeight - totalChartContainerPadding - totalTypographyPadding) * 0.95;
	// end height calculations

	const buildStatBoxes = (stats, uptime) => {
		if (Object.keys(stats).length === 0) return [];
		let latestCheck = stats?.aggregateData?.latestCheck ?? null;
		if (latestCheck === null) return [];

		// Extract values from latest check
		const physicalCores = latestCheck?.cpu?.physical_core ?? 0;
		const logicalCores = latestCheck?.cpu?.logical_core ?? 0;
		const cpuFrequency = latestCheck?.cpu?.frequency ?? 0;
		const cpuTemperature =
			latestCheck?.cpu?.temperature?.length > 0
				? latestCheck.cpu.temperature.reduce((acc, curr) => acc + curr, 0) /
					latestCheck.cpu.temperature.length
				: 0;
		const memoryTotalBytes = latestCheck?.memory?.total_bytes ?? 0;
		const diskTotalBytes = latestCheck?.disk[0]?.total_bytes ?? 0;
		const os = latestCheck?.host?.os ?? null;
		const platform = latestCheck?.host?.platform ?? null;
		const osPlatform = os === null && platform === null ? null : `${os} ${platform}`;
		return [
			{
				id: 7,
				sx: statusStyles[determineState(monitor)],
				heading: "Status",
				subHeading: monitor?.status === true ? "Active" : "Inactive",
			},
			{
				id: 0,
				heading: "CPU (Physical)",
				subHeading: (
					<>
						{physicalCores}
						<Typography component="span">cores</Typography>
					</>
				),
			},
			{
				id: 1,
				heading: "CPU (Logical)",
				subHeading: (
					<>
						{logicalCores}
						<Typography component="span">cores</Typography>
					</>
				),
			},
			{
				id: 2,
				heading: "CPU Frequency",
				subHeading: (
					<>
						{(cpuFrequency / 1000).toFixed(2)}
						<Typography component="span">Ghz</Typography>
					</>
				),
			},
			{
				id: 3,
				heading: "Average CPU Temperature",
				subHeading: (
					<>
						{cpuTemperature.toFixed(2)}
						<Typography component="span">C</Typography>
					</>
				),
			},
			{
				id: 4,
				heading: "Memory",
				subHeading: formatBytes(memoryTotalBytes),
			},
			{
				id: 5,
				heading: "Disk",
				subHeading: formatBytes(diskTotalBytes),
			},
			{
				id: 6,
				heading: "Uptime",
				subHeading: (
					<>
						{(uptime * 100).toFixed(2)}
						<Typography component="span">%</Typography>
					</>
				),
			},

			{
				id: 8,
				heading: "OS",
				subHeading: osPlatform,
			},
		];
	};

	const buildGaugeBoxConfigs = (stats) => {
		if (Object.keys(stats).length === 0) return [];

		let latestCheck = stats?.aggregateData?.latestCheck ?? null;
		if (latestCheck === null) return [];

		// Extract values from latest check
		const memoryUsagePercent = latestCheck?.memory?.usage_percent ?? 0;
		const memoryUsedBytes = latestCheck?.memory?.used_bytes ?? 0;
		const memoryTotalBytes = latestCheck?.memory?.total_bytes ?? 0;
		const cpuUsagePercent = latestCheck?.cpu?.usage_percent ?? 0;
		const cpuPhysicalCores = latestCheck?.cpu?.physical_core ?? 0;
		const cpuFrequency = latestCheck?.cpu?.frequency ?? 0;
		return [
			{
				type: "memory",
				value: decimalToPercentage(memoryUsagePercent),
				heading: "Memory usage",
				metricOne: "Used",
				valueOne: formatBytes(memoryUsedBytes, true),
				metricTwo: "Total",
				valueTwo: formatBytes(memoryTotalBytes, true),
			},
			{
				type: "cpu",
				value: decimalToPercentage(cpuUsagePercent),
				heading: "CPU usage",
				metricOne: "Cores",
				valueOne: cpuPhysicalCores ?? 0,
				metricTwo: "Frequency",
				valueTwo: `${(cpuFrequency / 1000).toFixed(2)} Ghz`,
			},
			...(latestCheck?.disk ?? []).map((disk, idx) => ({
				type: "disk",
				diskIndex: idx,
				value: decimalToPercentage(disk.usage_percent),
				heading: `Disk${idx} usage`,
				metricOne: "Used",
				valueOne: formatBytes(disk.total_bytes - disk.free_bytes, true),
				metricTwo: "Total",
				valueTwo: formatBytes(disk.total_bytes, true),
			})),
		];
	};

	const buildTemps = (checks) => {
		let numCores = 1;
		if (checks === null) return { temps: [], tempKeys: [] };

		for (const check of checks) {
			if (check?.avgTemperature?.length > numCores) {
				numCores = check.avgTemperature.length;
				break;
			}
		}
		const temps = checks.map((check) => {
			// If there's no data, set the temperature to 0
			if (
				check?.avgTemperature?.length === 0 ||
				check?.avgTemperature === undefined ||
				check?.avgTemperature === null
			) {
				check.avgTemperature = Array(numCores).fill(0);
			}
			const res = check?.avgTemperature?.reduce(
				(acc, cur, idx) => {
					acc[`core${idx + 1}`] = cur;
					return acc;
				},
				{
					_id: check._id,
				}
			);
			return res;
		});
		if (temps.length === 0 || !temps[0]) {
			return { temps: [], tempKeys: [] };
		}

		return {
			tempKeys: Object.keys(temps[0] || {}).filter((key) => key !== "_id"),
			temps,
		};
	};

	const buildAreaChartConfigs = (checks) => {
		let latestCheck = checks[0] ?? null;
		if (latestCheck === null) return [];
		const { temps, tempKeys } = buildTemps(checks);
		return [
			{
				type: "memory",
				data: checks,
				dataKeys: ["avgMemoryUsage"],
				heading: "Memory usage",
				strokeColor: theme.palette.primary.main,
				gradientStartColor: theme.palette.primary.main,
				yLabel: "Memory usage",
				yDomain: [0, 1],
				yTick: <PercentTick />,
				xTick: <TzTick />,
				toolTip: (
					<InfrastructureTooltip
						dotColor={theme.palette.primary.main}
						yKey={"avgMemoryUsage"}
						yLabel={"Memory usage"}
					/>
				),
			},
			{
				type: "cpu",
				data: checks,
				dataKeys: ["avgCpuUsage"],
				heading: "CPU usage",
				strokeColor: theme.palette.success.main,
				gradientStartColor: theme.palette.success.main,
				yLabel: "CPU usage",
				yDomain: [0, 1],
				yTick: <PercentTick />,
				xTick: <TzTick />,
				toolTip: (
					<InfrastructureTooltip
						dotColor={theme.palette.success.main}
						yKey={"avgCpuUsage"}
						yLabel={"CPU usage"}
					/>
				),
			},
			{
				type: "temperature",
				data: temps,
				dataKeys: tempKeys,
				strokeColor: theme.palette.error.main,
				gradientStartColor: theme.palette.error.main,
				heading: "CPU Temperature",
				yLabel: "Temperature",
				xTick: <TzTick />,
				yDomain: [
					0,
					Math.max(
						Math.max(...temps.flatMap((t) => tempKeys.map((k) => t[k]))) * 1.1,
						200
					),
				],
				toolTip: (
					<TemperatureTooltip
						keys={tempKeys}
						dotColor={theme.palette.error.main}
					/>
				),
			},
			...(latestCheck?.disks?.map((disk, idx) => ({
				type: "disk",
				data: checks,
				diskIndex: idx,
				dataKeys: [`disks[${idx}].usagePercent`],
				heading: `Disk${idx} usage`,
				strokeColor: theme.palette.warning.main,
				gradientStartColor: theme.palette.warning.main,
				yLabel: "Disk Usage",
				yDomain: [0, 1],
				yTick: <PercentTick />,
				xTick: <TzTick />,
				toolTip: (
					<InfrastructureTooltip
						dotColor={theme.palette.warning.main}
						yKey={`disks.usagePercent`}
						yLabel={"Disc usage"}
						yIdx={idx}
					/>
				),
			})) || []),
		];
	};

	// Fetch data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await networkService.getHardwareDetailsByMonitorId({
					authToken: authToken,
					monitorId: monitorId,
					dateRange: dateRange,
				});
				response.data.data;
				setMonitor(response.data.data);
			} catch (error) {
				navigate("/not-found", { replace: true });
				logger.error(error);
			}
		};
		fetchData();
	}, [authToken, monitorId, dateRange, navigate]);

	const statBoxConfigs = buildStatBoxes(
		monitor?.stats ?? {},
		monitor?.uptimePercentage ?? "Unknown"
	);
	const gaugeBoxConfigs = buildGaugeBoxConfigs(monitor?.stats ?? {});
	const areaChartConfigs = buildAreaChartConfigs(monitor?.stats?.checks ?? []);
	const lastChecked =
		Date.now() - new Date(monitor?.stats?.aggregateData?.latestCheck?.createdAt);
	return (
		<Box>
			<Breadcrumbs list={navList} />
			{monitor?.stats.checks?.length > 0 ? (
				<Stack
					direction="column"
					gap={theme.spacing(10)}
					mt={theme.spacing(10)}
				>
					<Stack
						direction="row"
						gap={theme.spacing(8)}
					>
						<Box>
							<PulseDot color={statusColor[determineState(monitor)]} />
						</Box>
						<Typography
							alignSelf="end"
							component="h1"
							variant="h1"
						>
							{monitor.name}
						</Typography>
						<Typography alignSelf="end">{monitor.url || "..."}</Typography>
						<Box sx={{ flexGrow: 1 }} />
						<Typography alignSelf="end">
							Checking every {formatDurationRounded(monitor?.interval)}
						</Typography>
						<Typography alignSelf="end">
							Last checked {formatDurationSplit(lastChecked).time}{" "}
							{formatDurationSplit(lastChecked).format} ago
						</Typography>
					</Stack>

					<Stack
						direction="row"
						flexWrap="wrap"
						gap={theme.spacing(8)}
					>
						{statBoxConfigs.map((statBox) => (
							<StatBox
								key={statBox.id}
								{...statBox}
							/>
						))}
					</Stack>

					<Stack
						direction="row"
						gap={theme.spacing(8)}
					>
						{gaugeBoxConfigs.map((config) => {
							return (
								<GaugeBox
									key={`${config.type}-${config.diskIndex ?? ""}`}
									value={config.value}
									heading={config.heading}
									metricOne={config.metricOne}
									valueOne={config.valueOne}
									metricTwo={config.metricTwo}
									valueTwo={config.valueTwo}
								/>
							);
						})}
					</Stack>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
						gap={theme.spacing(8)}
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
					<Stack
						direction={"row"}
						height={chartContainerHeight} // FE team HELP!
						gap={theme.spacing(8)} // FE team HELP!
						flexWrap="wrap" // //FE team HELP! Better way to do this?
						sx={{
							"& > *": {
								flexBasis: `calc(50% - ${theme.spacing(8)})`,
								maxWidth: `calc(50% - ${theme.spacing(8)})`,
							},
						}}
					>
						{areaChartConfigs.map((config) => {
							return (
								<BaseBox key={`${config.type}-${config.diskIndex ?? ""}`}>
									<Typography
										component="h2"
										padding={theme.spacing(8)}
									>
										{config.heading}
									</Typography>
									<AreaChart
										height={areaChartHeight}
										data={config.data}
										dataKeys={config.dataKeys}
										xKey="_id"
										yDomain={config.yDomain}
										customTooltip={config.toolTip}
										xTick={config.xTick}
										yTick={config.yTick}
										strokeColor={config.strokeColor}
										gradient={true}
										gradientStartColor={config.gradientStartColor}
										gradientEndColor="#ffffff"
									/>
								</BaseBox>
							);
						})}
					</Stack>
				</Stack>
			) : (
				<Empty
					styles={{
						border: 1,
						borderColor: theme.palette.border.light,
						borderRadius: theme.shape.borderRadius,
						backgroundColor: theme.palette.background.main,
						p: theme.spacing(30),
					}}
				/>
			)}
		</Box>
	);
};

export default InfrastructureDetails;
