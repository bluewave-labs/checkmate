import { Box, Stack } from "@mui/material";
// Utils
import { useTheme } from "@emotion/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useIsAdmin } from "../../Hooks/useIsAdmin";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../Utils/toastUtils";
import useDebounce from "../../Utils/debounce";
import { networkService } from "../../main";
import BarChart from "../../Components/Charts/BarChart";

const PublicPage = () => {
	// Redux state
	const rowsPerPage = useSelector((state) => state.ui.monitors.rowsPerPage);
	// Local state
	const [sort, setSort] = useState({});
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [monitorUpdateTrigger, setMonitorUpdateTrigger] = useState(false);
	const [monitors, setMonitors] = useState([]);
	const [filteredMonitors, setFilteredMonitors] = useState([]);
	const [monitorsSummary, setMonitorsSummary] = useState({});

	// Utils
	const debouncedFilter = useDebounce(search, 500);
	const dispatch = useDispatch();
	const theme = useTheme();
	const navigate = useNavigate();
	const isAdmin = useIsAdmin();
	const authState = useSelector((state) => state.auth);

	const fetchParams = useMemo(
		() => ({
			authToken: authState.authToken,
			teamId: authState.user.teamId,
			sort: { field: sort.field, order: sort.order },
			filter: debouncedFilter,
			page,
			rowsPerPage,
		}),
		[authState.authToken, authState.user.teamId, sort, debouncedFilter, page, rowsPerPage]
	);

	const getMonitorWithPercentage = useCallback((monitor, theme) => {
		let uptimePercentage = "";
		let percentageColor = theme.palette.percentage.uptimeExcellent;

		if (monitor.uptimePercentage !== undefined) {
			uptimePercentage =
				monitor.uptimePercentage === 0
					? "0"
					: (monitor.uptimePercentage * 100).toFixed(2);

			percentageColor =
				monitor.uptimePercentage < 0.25
					? theme.palette.percentage.uptimePoor
					: monitor.uptimePercentage < 0.5
						? theme.palette.percentage.uptimeFair
						: monitor.uptimePercentage < 0.75
							? theme.palette.percentage.uptimeGood
							: theme.palette.percentage.uptimeExcellent;
		}

		return {
			id: monitor._id,
			name: monitor.name,
			url: monitor.url,
			title: monitor.name,
			percentage: uptimePercentage,
			percentageColor,
			monitor: monitor,
		};
	}, []);

	const fetchMonitors = useCallback(async () => {
		try {
			setIsLoading(true);
			const config = fetchParams;
			const res = await networkService.getMonitorsByTeamId({
				authToken: config.authToken,
				teamId: config.teamId,
				limit: 25,
				types: ["http", "ping", "docker", "port"],
				page: config.page,
				rowsPerPage: config.rowsPerPage,
				filter: config.filter,
				field: config.sort.field,
				order: config.sort.order,
			});
			const { monitors, filteredMonitors, summary } = res.data.data;
			const mappedMonitors = filteredMonitors.map((monitor) =>
				getMonitorWithPercentage(monitor, theme)
			);
			setMonitors(monitors);
			setFilteredMonitors(mappedMonitors);
			setMonitorsSummary(summary);
		} catch (error) {
			createToast({
				body: error.message,
			});
		} finally {
			setIsLoading(false);
			setIsSearching(false);
		}
	}, [fetchParams, getMonitorWithPercentage, theme]);

	useEffect(() => {
		fetchMonitors();
	}, [fetchMonitors, monitorUpdateTrigger]);

	return (
		<Stack sx={{ alignItems: "center" }}>
			<Stack>
				{filteredMonitors.map((m, idx) => (
					<BarChart
						key={idx}
						checks={m.monitor.checks.slice().reverse()}						
						barWidth={ theme.spacing(15)}
						barMarginBottom={theme.spacing(4)}
						
					/>
				))}
			</Stack>
		</Stack>
	);
};

export default PublicPage;
