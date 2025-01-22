// Components
import { Box, Stack, Button } from "@mui/material";
import Greeting from "../../../Utils/greeting";
import SkeletonLayout from "./skeleton";
import Fallback from "./fallback";
import StatusBox from "./StatusBox";
import UptimeDataTable from "./UptimeDataTable";
import Pagination from "../../../Components/Table/TablePagination";

// Utils
import { useTheme } from "@emotion/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { setRowsPerPage } from "../../../Features/UI/uiSlice";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../../Utils/toastUtils";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import useDebounce from "../../../Utils/debounce";
import { networkService } from "../../../main";

const BREADCRUMBS = [{ name: `Uptime`, path: "/uptime" }];

const UptimeMonitors = () => {
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
		let percentageColor = "";

		if (monitor.uptimePercentage !== undefined) {
			uptimePercentage =
				monitor.uptimePercentage === 0
					? "0"
					: (monitor.uptimePercentage * 100).toFixed(2);

			percentageColor =
				monitor.uptimePercentage < 0.25
					? theme.palette.error.main
					: monitor.uptimePercentage < 0.5
						? theme.palette.warning.main
						: monitor.uptimePercentage < 0.75
							? theme.palette.success.main
							: theme.palette.success.main;
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

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		dispatch(
			setRowsPerPage({
				value: parseInt(event.target.value, 10),
				table: "monitors",
			})
		);
		setPage(0);
	};

	const triggerUpdate = useCallback(() => {
		setMonitorUpdateTrigger((prev) => !prev);
	}, []);
	const totalMonitors = monitorsSummary?.totalMonitors ?? 0;
	const hasMonitors = totalMonitors > 0;
	const canAddMonitor = isAdmin && hasMonitors;

	return (
		<Stack
			className="monitors"
			gap={theme.spacing(8)}
		>
			<Box>
				<Breadcrumbs list={BREADCRUMBS} />
				<Stack
					direction="row"
					justifyContent="end"
					alignItems="center"
					mt={theme.spacing(5)}
					gap={theme.spacing(6)}
				>
					{canAddMonitor && (
						<>
							<Button
								variant="contained"
								color="accent"
								onClick={() => {
									navigate("/uptime/create");
								}}
								sx={{
									fontWeight: 500,
									whiteSpace: "nowrap",
									/* TODO IMPORTANT this should be applied to all buttons */
									"&:focus-visible": {
										outline: `2px solid ${theme.palette.primary.contrastText}`,
										outlineOffset: 4,
									},
								}}
							>
								Create new
							</Button>
						</>
					)}
				</Stack>
				<Greeting type="uptime" />
			</Box>
			{
				<>
					{!isLoading && !hasMonitors && <Fallback isAdmin={isAdmin} />}
					{isLoading ? (
						<SkeletonLayout />
					) : (
						hasMonitors && (
							<>
								<Stack
									gap={theme.spacing(8)}
									direction="row"
									justifyContent="space-between"
								>
									<StatusBox
										title="up"
										value={monitorsSummary?.upMonitors ?? 0}
									/>
									<StatusBox
										title="down"
										value={monitorsSummary?.downMonitors ?? 0}
									/>
									<StatusBox
										title="paused"
										value={monitorsSummary?.pausedMonitors ?? 0}
									/>
								</Stack>
								<UptimeDataTable
									isAdmin={isAdmin}
									isLoading={isLoading}
									filteredMonitors={filteredMonitors}
									monitors={monitors}
									monitorCount={totalMonitors}
									sort={sort}
									setSort={setSort}
									debouncedSearch={debouncedFilter}
									setSearch={setSearch}
									isSearching={isSearching}
									setIsSearching={setIsSearching}
									setIsLoading={setIsLoading}
									triggerUpdate={triggerUpdate}
								/>
								<Pagination
									itemCount={totalMonitors}
									paginationLabel="monitors"
									page={page}
									rowsPerPage={rowsPerPage}
									handleChangePage={handleChangePage}
									handleChangeRowsPerPage={handleChangeRowsPerPage}
								/>
							</>
						)
					)}
				</>
			}
		</Stack>
	);
};

export default UptimeMonitors;
