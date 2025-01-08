// Components
import { Box, Stack, Button } from "@mui/material";
import Greeting from "../../../Utils/greeting";
import SkeletonLayout from "./skeleton";
import Fallback from "./fallback";
import StatusBox from "./StatusBox";
import UptimeDataTable from "./UptimeDataTable";
import { Pagination } from "../../../Components/Table/TablePagination";

// Utils
import { useTheme } from "@emotion/react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
	getUptimeSummaryByTeamId,
	getUptimeMonitorsByTeamId,
} from "../../../Features/UptimeMonitors/uptimeMonitorsSlice";
import { setRowsPerPage } from "../../../Features/UI/uiSlice";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../../Utils/toastUtils";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import useDebounce from "../../../Utils/debounce";

const BREADCRUMBS = [{ name: `Uptime`, path: "/uptime" }];

const UptimeMonitors = () => {
	// Redux state
	const { isLoading, monitorsSummary } = useSelector((state) => state.uptimeMonitors);
	const authState = useSelector((state) => state.auth);
	const { rowsPerPage } = useSelector((state) => state.ui.monitors);

	// Local state
	const [monitors, setMonitors] = useState([]);
	const [sort, setSort] = useState({});
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [isSearching, setIsSearching] = useState(false);
	const [monitorUpdateTrigger, setMonitorUpdateTrigger] = useState(false);

	// Utils
	const debouncedFilter = useDebounce(search, 500);
	const dispatch = useDispatch();
	const theme = useTheme();
	const navigate = useNavigate();
	const isAdmin = useIsAdmin();
	const { isLoading, monitorsSummary } = useSelector((state) => state.uptimeMonitors);
	const authState = useSelector((state) => state.auth);
	const dispatch = useDispatch({});
	const [monitorUpdateTrigger, setMonitorUpdateTrigger] = useState(false);


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
			const action = await dispatch(getUptimeMonitorsByTeamId(fetchParams));
			if (action.payload.success) {
				const { monitors } = action.payload.data;
				const mappedMonitors = monitors.map((monitor) =>
					getMonitorWithPercentage(monitor, theme)
				);
				setMonitors(mappedMonitors);
			} else {
				// TODO: Check for other errors?
				throw new Error("Error fetching monitors");
			}
		} catch (error) {
			createToast({
				body: "Error fetching monitors",
			});
		} finally {
			setIsSearching(false);
		}
	}, [fetchParams, dispatch, getMonitorWithPercentage, theme]);

	useEffect(() => {
		dispatch(getUptimeSummaryByTeamId(authState.authToken));
		fetchMonitors();
	}, [fetchMonitors, monitorUpdateTrigger, authState.authToken, dispatch]);

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

	const triggerUpdate = () => {
		setMonitorUpdateTrigger((prev) => !prev);
	};
	const totalMonitors = monitorsSummary?.monitorCounts?.total;
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
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								navigate("/uptime/create");
							}}
							sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
						>
							Create new
						</Button>
					)}
				</Stack>
				<Greeting type="uptime" />
			</Box>
			{
				<>
					{!isLoading && !hasMonitors && <Fallback isAdmin={isAdmin} />}
					{hasMonitors && (
						<>
							<Stack
								gap={theme.spacing(8)}
								direction="row"
								justifyContent="space-between"
							>
								<StatusBox
									title="up"
									value={monitorsSummary?.monitorCounts?.up ?? 0}
								/>
								<StatusBox
									title="down"
									value={monitorsSummary?.monitorCounts?.down ?? 0}
								/>
								<StatusBox
									title="paused"
									value={monitorsSummary?.monitorCounts?.paused ?? 0}
								/>
							</Stack>
							<UptimeDataTable
								isAdmin={isAdmin}
								monitors={monitors}
								monitorCount={totalMonitors}
								sort={sort}
								setSort={setSort}
								search={search}
								setSearch={setSearch}
								isSearching={isSearching}
								setIsSearching={setIsSearching}
								triggerUpdate={triggerUpdate}
							/>
							<Pagination
								monitorCount={totalMonitors}
								page={page}
								rowsPerPage={rowsPerPage}
								handleChangePage={handleChangePage}
								handleChangeRowsPerPage={handleChangeRowsPerPage}
							/>
						</>
					)}
				</>
			}
		</Stack>
	);
};

export default UptimeMonitors;
