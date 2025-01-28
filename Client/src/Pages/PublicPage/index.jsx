import { Link, Box, Stack, Typography, Button } from "@mui/material";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import SuccessSVG from "../../assets/icons/success.svg?react";
import AlertIcon from "../../assets/icons/alert-circle.svg?react";
import Avatar from "../../Components/Avatar";

import { createToast } from "../../Utils/toastUtils";
import useDebounce from "../../Utils/debounce";
import { networkService } from "../../main";
import BarChart from "../../Components/Charts/BarChart";
import useUtils from "../Uptime/Home/Hooks/useUtils";
import Host from "../Uptime/Home/Components/Host";
import { StatusLabel } from "../../Components/Label";
import { getMonitorWithPercentage } from "../../Utils/monitorUtils";

const PublicPage = () => {
	// Redux state
	const rowsPerPage = useSelector((state) => state.ui.monitors.rowsPerPage);
	// Local state
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const navigate = useNavigate();
	const [filteredMonitors, setFilteredMonitors] = useState([]);

	const { determineState } = useUtils();

	// Utils
	const debouncedFilter = useDebounce(search, 500);
	const theme = useTheme();
	const authState = useSelector((state) => state.auth);

	const fetchMonitorsWithPercentage = useCallback(getMonitorWithPercentage, []);

	const fetchParams = useMemo(
		() => ({
			authToken: authState.authToken,
			teamId: authState.user.teamId,
			filter: debouncedFilter,
			page,
			rowsPerPage,
		}),
		[authState.authToken, authState.user.teamId, debouncedFilter, page, rowsPerPage]
	);

	const fetchMonitors = useCallback(async () => {
		try {
			const config = fetchParams;
			const res = await networkService.getMonitorsByTeamId({
				authToken: config.authToken,
				teamId: config.teamId,
				limit: 25,
				types: ["http"],
				page: config.page,
				rowsPerPage: config.rowsPerPage,
				filter: config.filter,
			});
			const { filteredMonitors } = res.data.data;
			const mappedMonitors = filteredMonitors.map((monitor) =>
				fetchMonitorsWithPercentage(monitor, theme)
			);
			setFilteredMonitors(mappedMonitors);
		} catch (error) {
			createToast({
				body: error.message,
			});
		}
	}, [fetchParams, fetchMonitorsWithPercentage, theme]);

	useEffect(() => {
		fetchMonitors();
	}, [fetchMonitors]);

	const adminLogin = () => {
		navigate("/login");
	};

	const allServersUp = !filteredMonitors.some((m) => !m.monitor.status);
	const BAR_GAP = 1.5;
	const BARS_SHOWN = 25;
	const BAR_WIDTH = 15;
	const BAR_MARGIN_BOTTOM = 4;

	return (
		<Box>
			<Stack
				direction={"row"}
				sx={{ alignItems: "center", m: theme.spacing(4) }}
				gap={theme.spacing(4)}
			>
				<Avatar
					src={"/static/images/avatar/2.jpg"}
					sx={{ marginRight: theme.spacing(4) }}
				/>
				<Typography component={"h2"}> URL retrieved from status page </Typography>
			</Stack>
			<Stack sx={{ alignItems: "center" }}>
				<Stack
					direction={"row"}
					sx={{
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography
						component={"h2"}
						sx={{
							mb: theme.spacing(4),
							fontSize: "18px",
							fontWeight: "600",
						}}
					>
						{" "}
						Service status
					</Typography>
				</Stack>
				<Stack
					direction={"row"}
					sx={{
						alignItems: "center",
						justifyContent: "center",
						width: theme.spacing(
							BAR_WIDTH * BARS_SHOWN + BAR_GAP * (BARS_SHOWN - 1) + 50
						),
						height: theme.spacing(30),
						backgroundColor: allServersUp
							? theme.palette.success.lowContrast
							: theme.palette.warning.lowContrast,
						borderRadius: theme.spacing(1.5),
						mb: theme.spacing(8),
					}}
				>
					{allServersUp ? <SuccessSVG /> : <AlertIcon />}
					<Typography sx={{ ml: theme.spacing(4), color: theme.palette.primary.main }}>
						{allServersUp ? "All systems operational" : "Degraded Performance"}
					</Typography>
				</Stack>
			</Stack>
			<Stack
				sx={{
					overflowY: "scroll",
					alignItems: "center",
					minHeight: "500px",
					maxHeight: "660px",
					width: "100%",
				}}
			>
				{filteredMonitors.map((m, idx) => {
					const status = determineState(m);
					return (
						<Box key={idx}>
							<Stack
								direction={"row"}
								gap={theme.spacing(2)}
								sx={{ alignItems: "center" }}
							>
								<Stack gap={theme.spacing(2)}>
									<Stack
										direction={"row"}
										sx={{ mb: theme.spacing(4), justifyContent: "start" }}
									>
										<Stack
											direction="row"
											sx={{
												width: "35%",
											}}
										>
											<Host
												key={idx}
												url={m.title}
												title={m.title}
												percentageColor={m.percentageColor}
												percentage={m.percentage}
											/>
										</Stack>
									</Stack>
									<BarChart
										key={idx}
										checks={m.monitor.checks.slice().reverse()}
										barWidth={BAR_WIDTH}
										barMarginBottom={BAR_MARGIN_BOTTOM}
										barsShown={BARS_SHOWN}
										barGap={BAR_GAP}
									/>
									<Stack
										direction="row"
										sx={{ alignSelf: "end" }}
									>
										<Typography>Last update at {m.monitor.updatedAt}</Typography>
									</Stack>
								</Stack>

								<StatusLabel
									status={status}
									text={status}
									customStyles={{
										textTransform: "capitalize",
										height: theme.spacing(20),
									}}
								/>
							</Stack>
						</Box>
					);
				})}
			</Stack>
			<Stack
				direction="row"
				sx={{ alignItems: "center", justifyContent: "center" }}
			>
				<Typography
					component={"p"}
					sx={{
						color: "#067647", // value from figma, need to be added to global at some point
					}}
				>
					Administrator? Login
				</Typography>
				<Button
					variant="text"
					sx={{
						ml: theme.spacing(-6),
						textDecoration: "underline",
						color: "#067647", // value from figma, need to be added to global at some point
					}}
					onClick={adminLogin}
				>
					here
				</Button>
			</Stack>
		</Box>
	);
};

export default PublicPage;
