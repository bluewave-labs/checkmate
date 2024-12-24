import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import {
	Box,
	Button,
	Popover,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { networkService } from "../../../main";
import { logger } from "../../../Utils/Logger";
import { formatDurationRounded, formatDurationSplit } from "../../../Utils/timeUtils";
import MonitorDetailsAreaChart from "../../../Components/Charts/MonitorDetailsAreaChart";
import ButtonGroup from "@mui/material/ButtonGroup";
import SettingsIcon from "../../../assets/icons/settings-bold.svg?react";
import CertificateIcon from "../../../assets/icons/certificate.svg?react";
import UptimeIcon from "../../../assets/icons/uptime-icon.svg?react";
import ResponseTimeIcon from "../../../assets/icons/response-time-icon.svg?react";
import AverageResponseIcon from "../../../assets/icons/average-response-icon.svg?react";
import IncidentsIcon from "../../../assets/icons/incidents.svg?react";
import HistoryIcon from "../../../assets/icons/history-icon.svg?react";
import PaginationTable from "./PaginationTable";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import PulseDot from "../../../Components/Animated/PulseDot";
import { ChartBox } from "./styled";
import { DownBarChart, ResponseGaugeChart, UpBarChart } from "./Charts";
import SkeletonLayout from "./skeleton";
import "./index.css";
import useUtils from "../utils";
import { formatDateWithTz } from "../../../Utils/timeUtils";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import IconBox from "../../../Components/IconBox";
import StatBox from "../../../Components/StatBox";
/**
 * Details page component displaying monitor details and related information.
 * @component
 */
const DetailsPage = () => {
	const theme = useTheme();
	const { statusColor, statusStyles, statusMsg, determineState } = useUtils();
	const isAdmin = useIsAdmin();
	const [monitor, setMonitor] = useState({});
	const { monitorId } = useParams();
	const { authToken } = useSelector((state) => state.auth);
	const [dateRange, setDateRange] = useState("day");
	const [certificateExpiry, setCertificateExpiry] = useState("N/A");
	const navigate = useNavigate();

	const [anchorEl, setAnchorEl] = useState(null);
	const openCertificate = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const closeCertificate = () => {
		setAnchorEl(null);
	};

	const dateFormat = dateRange === "day" ? "MMM D, h A" : "MMM D";
	const uiTimezone = useSelector((state) => state.ui.timezone);

	const fetchMonitor = useCallback(async () => {
		try {
			const res = await networkService.getStatsByMonitorId({
				authToken: authToken,
				monitorId: monitorId,
				sortOrder: null,
				limit: null,
				dateRange: dateRange,
				numToDisplay: 50,
				normalize: true,
			});
			setMonitor(res?.data?.data ?? {});
		} catch (error) {
			logger.error(error);
			navigate("/not-found", { replace: true });
		}
	}, [authToken, monitorId, navigate, dateRange]);

	useEffect(() => {
		fetchMonitor();
	}, [fetchMonitor]);

	useEffect(() => {
		const fetchCertificate = async () => {
			if (monitor?.type !== "http") {
				return;
			}
			try {
				const res = await networkService.getCertificateExpiry({
					authToken: authToken,
					monitorId: monitorId,
				});
				if (res?.data?.data?.certificateDate) {
					const date = res.data.data.certificateDate;
					setCertificateExpiry(formatDateWithTz(date, dateFormat, uiTimezone) ?? "N/A");
				}
			} catch (error) {
				setCertificateExpiry("N/A");
				console.error(error);
			}
		};
		fetchCertificate();
	}, [authToken, monitorId, monitor, uiTimezone, dateFormat]);

	const splitDuration = (duration) => {
		const { time, format } = formatDurationSplit(duration);
		return (
			<>
				{time}
				<Typography component="span">{format}</Typography>
			</>
		);
	};

	let loading = Object.keys(monitor).length === 0;

	const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
	const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);

	const BREADCRUMBS = [
		{ name: "uptime", path: "/uptime" },
		{ name: "details", path: `/uptime/${monitorId}` },
	];
	return (
		<Box className="monitor-details">
			{loading ? (
				<SkeletonLayout />
			) : (
				<>
					<Breadcrumbs list={BREADCRUMBS} />
					<Stack
						gap={theme.spacing(10)}
						mt={theme.spacing(10)}
					>
						<Stack
							direction="row"
							gap={theme.spacing(2)}
						>
							<Box>
								<Typography
									component="h1"
									variant="h1"
								>
									{monitor.name}
								</Typography>
								<Stack
									direction="row"
									alignItems="center"
									height="fit-content"
									gap={theme.spacing(2)}
								>
									<Tooltip
										title={statusMsg[determineState(monitor)]}
										disableInteractive
										slotProps={{
											popper: {
												modifiers: [
													{
														name: "offset",
														options: {
															offset: [0, -8],
														},
													},
												],
											},
										}}
									>
										<Box>
											<PulseDot color={statusColor[determineState(monitor)]} />
										</Box>
									</Tooltip>
									<Typography
										component="h2"
										variant="h2"
									>
										{monitor.url?.replace(/^https?:\/\//, "") || "..."}
									</Typography>
									<Typography
										position="relative"
										variant="body2"
										mt={theme.spacing(1)}
										ml={theme.spacing(6)}
										sx={{
											"&:before": {
												position: "absolute",
												content: `""`,
												width: 4,
												height: 4,
												borderRadius: "50%",
												backgroundColor: theme.palette.text.tertiary,
												opacity: 0.8,
												left: -9,
												top: "50%",
												transform: "translateY(-50%)",
											},
										}}
									>
										Checking every {formatDurationRounded(monitor?.interval)}.
									</Typography>
								</Stack>
							</Box>
							<Stack
								direction="row"
								height={34}
								sx={{
									ml: "auto",
									alignSelf: "flex-end",
								}}
							>
								<IconBox
									mr={theme.spacing(4)}
									onClick={openCertificate}
									sx={{
										cursor: "pointer",
										"& svg": {
											width: 23,
											height: 23,
											top: "52%",
										},
									}}
								>
									<CertificateIcon />
								</IconBox>
								<Popover
									id="certificate-dropdown"
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={closeCertificate}
									disableScrollLock
									marginThreshold={null}
									anchorOrigin={{
										vertical: "bottom",
										horizontal: "center",
									}}
									transformOrigin={{
										vertical: "top",
										horizontal: "center",
									}}
									slotProps={{
										paper: {
											sx: {
												mt: theme.spacing(4),
												py: theme.spacing(2),
												px: theme.spacing(4),
												width: 140,
												backgroundColor: theme.palette.background.accent,
											},
										},
									}}
								>
									<Typography variant="body2">Certificate Expiry</Typography>
									<Typography
										component="span"
										fontSize={13}
										color={theme.palette.text.primary}
									>
										{certificateExpiry}
									</Typography>
								</Popover>
								{isAdmin && (
									<Button
										variant="contained"
										color="secondary"
										onClick={() => navigate(`/uptime/configure/${monitorId}`)}
										sx={{
											px: theme.spacing(5),
											"& svg": {
												mr: theme.spacing(3),
												"& path": {
													stroke: theme.palette.text.tertiary,
												},
											},
										}}
									>
										<SettingsIcon /> Configure
									</Button>
								)}
							</Stack>
						</Stack>
						<Stack
							direction="row"
							gap={theme.spacing(8)}
						>
							<StatBox
								sx={statusStyles[determineState(monitor)]}
								heading={"active for"}
								subHeading={splitDuration(monitor?.uptimeDuration)}
							/>
							<StatBox
								heading="last check"
								subHeading={splitDuration(monitor?.lastChecked)}
							/>
							<StatBox
								heading="last response time"
								subHeading={
									<>
										{monitor?.latestResponseTime}
										<Typography component="span">{"ms"}</Typography>
									</>
								}
							/>
						</Stack>
						<Box>
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
							<Stack
								direction="row"
								flexWrap="wrap"
								gap={theme.spacing(8)}
							>
								<ChartBox>
									<Stack>
										<IconBox>
											<UptimeIcon />
										</IconBox>
										<Typography component="h2">Uptime</Typography>
									</Stack>
									<Stack justifyContent="space-between">
										<Box position="relative">
											<Typography>Total Checks</Typography>
											<Typography component="span">
												{hoveredUptimeData !== null
													? hoveredUptimeData.totalChecks
													: monitor?.periodTotalChecks}
											</Typography>
											{hoveredUptimeData !== null && hoveredUptimeData.time !== null && (
												<Typography
													component="h5"
													position="absolute"
													top="100%"
													fontSize={11}
													color={theme.palette.text.tertiary}
												>
													{formatDateWithTz(
														hoveredUptimeData.time,
														dateFormat,
														uiTimezone
													)}
												</Typography>
											)}
										</Box>
										<Box>
											<Typography>Uptime Percentage</Typography>
											<Typography component="span">
												{hoveredUptimeData !== null
													? Math.floor(hoveredUptimeData.uptimePercentage * 10) / 10
													: Math.floor(monitor?.periodUptime * 10) / 10}
												<Typography component="span">%</Typography>
											</Typography>
										</Box>
									</Stack>
									<UpBarChart
										data={monitor?.aggregateData}
										type={dateRange}
										onBarHover={setHoveredUptimeData}
									/>
								</ChartBox>
								<ChartBox>
									<Stack>
										<IconBox>
											<IncidentsIcon />
										</IconBox>
										<Typography component="h2">Incidents</Typography>
									</Stack>
									<Box position="relative">
										<Typography>Total Incidents</Typography>
										<Typography component="span">
											{hoveredIncidentsData !== null
												? hoveredIncidentsData.totalIncidents
												: monitor?.periodIncidents}
										</Typography>
										{hoveredIncidentsData !== null &&
											hoveredIncidentsData.time !== null && (
												<Typography
													component="h5"
													position="absolute"
													top="100%"
													fontSize={11}
													color={theme.palette.text.tertiary}
												>
													{formatDateWithTz(
														hoveredIncidentsData.time,
														dateFormat,
														uiTimezone
													)}
												</Typography>
											)}
									</Box>
									<DownBarChart
										data={monitor?.aggregateData}
										type={dateRange}
										onBarHover={setHoveredIncidentsData}
									/>
								</ChartBox>
								<ChartBox justifyContent="space-between">
									<Stack>
										<IconBox>
											<AverageResponseIcon />
										</IconBox>
										<Typography component="h2">Average Response Time</Typography>
									</Stack>
									<ResponseGaugeChart
										data={[{ response: monitor?.periodAvgResponseTime }]}
									/>
								</ChartBox>
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
									<MonitorDetailsAreaChart checks={[...monitor.checks].reverse()} />
								</ChartBox>
								<ChartBox
									gap={theme.spacing(8)}
									sx={{
										flex: "100%",
										height: "fit-content",
										"& nav": { mt: theme.spacing(12) },
									}}
								>
									<Stack mb={theme.spacing(8)}>
										<IconBox>
											<HistoryIcon />
										</IconBox>
										<Typography
											component="h2"
											color={theme.palette.text.secondary}
										>
											History
										</Typography>
									</Stack>
									<PaginationTable
										monitorId={monitorId}
										dateRange={dateRange}
									/>
								</ChartBox>
							</Stack>
						</Box>
					</Stack>
				</>
			)}
		</Box>
	);
};

DetailsPage.propTypes = {
	isAdmin: PropTypes.bool,
};
export default DetailsPage;
