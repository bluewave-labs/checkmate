import { Box, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import CheckSVG from "../../assets/icons/checkbox-filled.svg?react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import { useIsAdmin } from "../../Hooks/useIsAdmin";
import { createToast } from "../../Utils/toastUtils";
import useDebounce from "../../Utils/debounce";
import { networkService } from "../../main";
import BarChart from "../../Components/Charts/BarChart";
import useUtils from "../Uptime/utils";
import Host from "../Uptime/Home/host";
import { StatusLabel } from "../../Components/Label";
import { getMonitorWithPercentage } from "../../Utils/monitorUtils";

const PublicPage = () => {
	// Redux state
	const rowsPerPage = useSelector((state) => state.ui.monitors.rowsPerPage);
	// Local state
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [filteredMonitors, setFilteredMonitors] = useState([]);

	const { determineState } = useUtils();

	// Utils
	const debouncedFilter = useDebounce(search, 500);
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const authState = useSelector((state) => state.auth);

	const fetchMonitorsWithPercentage = useCallback(getMonitorWithPercentage,[]);

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
				filter: config.filter
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

	const allServersUp = !filteredMonitors.some((m) => !m.monitor.status);
	return (
		<Stack sx={{ alignItems: "center" }}>
			<Stack>
				<Stack
					direction={"row"}
					sx={{
						alignItems: "center",
						justifyContent: "center",
						height: theme.spacing(30),
						width: "100%",
						backgroundColor: allServersUp
							? theme.palette.success.lowContrast
							: theme.palette.warning.lowContrast,
						borderRadius: theme.spacing(1.5),
						mb: theme.spacing(8),
					}}
				>
					{allServersUp ? <CheckSVG /> : <WarningAmberOutlinedIcon />}
					<Typography sx={{ ml: theme.spacing(4), color: theme.palette.primary.main }}>
						{allServersUp ? "All systems operational" : "Degraded Performance"}
					</Typography>
				</Stack>

				{filteredMonitors.map((m, idx) => {
					console.log("m");
					console.log(m);
					const status = determineState(m);
					return (
						<Box key={idx}>
							<Stack
								direction={"row"}
								sx={{ mb: theme.spacing(4), justifyContent: "start" }}
							>
								<Stack
									direction="row"
									sx={{ width: "35%", justifyContent: "space-between", flexWrap: "wrap" }}
								>
									<Host
										key={idx}
										url={m.url}
										title={m.title}
										percentageColor={m.percentageColor}
										percentage={m.percentage}
									/>

									<StatusLabel
										status={status}
										text={status}
										customStyles={{ textTransform: "capitalize" }}
									/>
								</Stack>
							</Stack>
							<BarChart
								key={idx}
								checks={m.monitor.checks.slice().reverse()}
								barWidth={theme.spacing(15)}
								barMarginBottom={theme.spacing(4)}
							/>
							<Stack
								direction="row"
								justifyContent={"end"}
							>
								<Typography>Last update at {m.monitor.updatedAt}</Typography>
							</Stack>
						</Box>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default PublicPage;
