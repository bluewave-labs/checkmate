import PropTypes from "prop-types";
import { Box, Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDurationRounded, formatDurationSplit } from "../../../Utils/timeUtils";
import { ChartBox } from "./styled";
import { logger } from "../../../Utils/Logger";
import { networkService } from "../../../main";
import SkeletonLayout from "./skeleton";
import SettingsIcon from "../../../assets/icons/settings-bold.svg?react";
import SpedometerIcon from "../../../assets/icons/spedometer-icon.svg?react";
import MetricsIcon from "../../../assets/icons/ruler-icon.svg?react";
import ScoreIcon from "../../../assets/icons/monitor-graph-line.svg?react";
import PerformanceIcon from "../../../assets/icons/performance-report.svg?react";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import PulseDot from "../../../Components/Animated/PulseDot";
import PagespeedDetailsAreaChart from "./Charts/AreaChart";
import Checkbox from "../../../Components/Inputs/Checkbox";
import PieChart from "./Charts/PieChart";
import useUtils from "../../Uptime/utils";
import "./index.css";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import StatBox from "../../../Components/StatBox";
import IconBox from "../../../Components/IconBox";

const PageSpeedDetails = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const isAdmin = useIsAdmin();
	const { statusColor, pagespeedStatusMsg, determineState } = useUtils();
	const [monitor, setMonitor] = useState({});
	const [audits, setAudits] = useState({});
	const { monitorId } = useParams();
	const { authToken } = useSelector((state) => state.auth);

	useEffect(() => {
		const fetchMonitor = async () => {
			try {
				const res = await networkService.getStatsByMonitorId({
					authToken: authToken,
					monitorId: monitorId,
					sortOrder: "desc",
					limit: 50,
					dateRange: "day",
					numToDisplay: null,
					normalize: null,
				});
				setMonitor(res?.data?.data ?? {});
				setAudits(res?.data?.data?.checks?.[0]?.audits ?? {});
			} catch (error) {
				logger.error(logger);
				navigate("/not-found", { replace: true });
			}
		};

		fetchMonitor();
	}, [monitorId, authToken, navigate]);

	let loading = Object.keys(monitor).length === 0;
	const data = monitor?.checks ? [...monitor.checks].reverse() : [];

	const splitDuration = (duration) => {
		const { time, format } = formatDurationSplit(duration);
		return (
			<>
				{time}
				<Typography component="span">{format}</Typography>
			</>
		);
	};

	const [metrics, setMetrics] = useState({
		accessibility: true,
		bestPractices: true,
		performance: true,
		seo: true,
	});
	const handleMetrics = (id) => {
		setMetrics((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<Stack
			className="page-speed-details"
			gap={theme.spacing(10)}
		>
			{loading ? (
				<SkeletonLayout />
			) : (
				<>
					<Breadcrumbs
						list={[
							{ name: "pagespeed", path: "/pagespeed" },
							{ name: "details", path: `/pagespeed/${monitorId}` },
						]}
					/>
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
									title={pagespeedStatusMsg[determineState(monitor)]}
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
									{monitor?.url}
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
						{isAdmin && (
							<Button
								variant="contained"
								color="secondary"
								onClick={() => navigate(`/pagespeed/configure/${monitorId}`)}
								sx={{
									ml: "auto",
									alignSelf: "flex-end",
									px: theme.spacing(5),
									"& svg": {
										mr: theme.spacing(3),
										"& path": {
											stroke: theme.palette.other.icon,
										},
									},
								}}
							>
								<SettingsIcon />
								Configure
							</Button>
						)}
					</Stack>
					<Stack
						direction="row"
						gap={theme.spacing(8)}
					>
						<StatBox
							heading="checks since"
							subHeading={
								<>
									{splitDuration(monitor?.uptimeDuration)}
									<Typography component="span">ago</Typography>
								</>
							}
						/>
						<StatBox
							heading="last check"
							subHeading={
								<>
									{splitDuration(monitor?.lastChecked)}
									<Typography component="span">ago</Typography>
								</>
							}
						/>
					</Stack>
					<Box>
						<Typography
							variant="body2"
							my={theme.spacing(8)}
						>
							Showing statistics for past 24 hours.
						</Typography>
						<ChartBox sx={{ gridTemplateColumns: "75% 25%" }}>
							<Stack
								direction="row"
								alignItems="center"
								gap={theme.spacing(6)}
							>
								<IconBox>
									<ScoreIcon />
								</IconBox>
								<Typography component="h2">Score history</Typography>
							</Stack>
							<Box>
								<PagespeedDetailsAreaChart
									data={data}
									interval={monitor?.interval}
									metrics={metrics}
								/>
							</Box>
							<Box>
								<Stack
									direction="row"
									alignItems="center"
									gap={theme.spacing(6)}
								>
									<IconBox>
										<MetricsIcon />
									</IconBox>
									<Typography component="h2">Metrics</Typography>
								</Stack>
								<Stack
									gap={theme.spacing(4)}
									mt={theme.spacing(16)}
									sx={{
										"& label": { pl: theme.spacing(6) },
									}}
								>
									<Box>
										<Typography
											fontSize={11}
											fontWeight={500}
										>
											Shown
										</Typography>
										<Divider sx={{ mt: theme.spacing(2) }} />
									</Box>
									<Checkbox
										id="accessibility-toggle"
										label="Accessibility"
										isChecked={metrics.accessibility}
										onChange={() => handleMetrics("accessibility")}
									/>
									<Divider />
									<Checkbox
										id="best-practices-toggle"
										label="Best Practices"
										isChecked={metrics.bestPractices}
										onChange={() => handleMetrics("bestPractices")}
									/>
									<Divider />
									<Checkbox
										id="performance-toggle"
										label="Performance"
										isChecked={metrics.performance}
										onChange={() => handleMetrics("performance")}
									/>
									<Divider />
									<Checkbox
										id="seo-toggle"
										label="Search Engine Optimization"
										isChecked={metrics.seo}
										onChange={() => handleMetrics("seo")}
									/>
									<Divider />
								</Stack>
							</Box>
						</ChartBox>
					</Box>
					<ChartBox
						flex={1}
						/* TODO apply 1fr 1fr for columns, and auto 1fr for Rows */
						sx={{ gridTemplateColumns: "50% 50%", gridTemplateRows: "15% 85%" }}
					>
						<Stack
							direction="row"
							alignItems="center"
							gap={theme.spacing(6)}
						>
							<IconBox>
								<PerformanceIcon />
							</IconBox>
							<Typography component="h2">Performance report</Typography>
						</Stack>
						<Stack
							alignItems="center"
							textAlign="center"
							minWidth="300px"
							flex={1}
							pt={theme.spacing(6)}
							pb={theme.spacing(12)}
						>
							<PieChart audits={audits} />
							<Typography
								variant="body1"
								mt="auto"
							>
								Values are estimated and may vary.{" "}
								<Typography
									component="span"
									fontSize="inherit"
									sx={{
										color: theme.palette.primary.main,
										fontWeight: 500,
										textDecoration: "underline",
										textUnderlineOffset: 2,
										transition: "all 200ms",
										cursor: "pointer",
										"&:hover": {
											textUnderlineOffset: 4,
										},
									}}
								>
									See calculator
								</Typography>
							</Typography>
						</Stack>
						<Box
							px={theme.spacing(20)}
							py={theme.spacing(8)}
							height="100%"
						>
							<Stack
								direction="row"
								alignItems="center"
								gap={theme.spacing(6)}
							>
								<IconBox>
									<SpedometerIcon />
								</IconBox>
								<Typography component="h2">Performance Metrics</Typography>
							</Stack>
							<Stack
								flexWrap="wrap"
								mt={theme.spacing(4)}
								gap={theme.spacing(4)}
							>
								{Object.keys(audits).map((key) => {
									if (key === "_id") return;

									let audit = audits[key];
									let score = audit.score * 100;
									let bg =
										score >= 90
											? theme.palette.success.main
											: score >= 50
												? theme.palette.warning.main
												: score >= 0
													? theme.palette.error.contrastText
													: theme.palette.unresolved.main;

									// Find the position where the number ends and the unit begins
									const match = audit.displayValue.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/);
									let value;
									let unit;
									if (match) {
										value = match[1];
										match[2] === "s" ? (unit = "seconds") : (unit = match[2]);
									} else {
										value = audit.displayValue;
									}

									return (
										<Stack
											key={`${key}-box`}
											justifyContent="space-between"
											direction="row"
											gap={theme.spacing(4)}
											p={theme.spacing(3)}
											border={1}
											borderColor={theme.palette.border.light}
											borderRadius={4}
										>
											<Box>
												<Typography
													fontSize={12}
													fontWeight={500}
													lineHeight={1}
													mb={1}
													textTransform="uppercase"
												>
													{audit.title}
												</Typography>
												<Typography
													component="span"
													fontSize={14}
													fontWeight={500}
													color={theme.palette.text.primary}
												>
													{value}
													<Typography
														component="span"
														variant="body2"
														ml={2}
													>
														{unit}
													</Typography>
												</Typography>
											</Box>
											<Box
												width={4}
												backgroundColor={bg}
												borderRadius={4}
											/>
										</Stack>
									);
								})}
							</Stack>
						</Box>
					</ChartBox>
				</>
			)}
		</Stack>
	);
};

PageSpeedDetails.propTypes = {
	isAdmin: PropTypes.bool,
	push: PropTypes.func,
};

export default PageSpeedDetails;
