import PropTypes from "prop-types";
import { useState, useEffect, memo, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import useUtils from "../../utils";

import { setRowsPerPage } from "../../../../Features/UI/uiSlice";
import { logger } from "../../../../Utils/Logger";
import { jwtDecode } from "jwt-decode";
import { networkService } from "../../../../main";

import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Box,
	CircularProgress,
} from "@mui/material";
import ActionsMenu from "../actionsMenu";
import Host from "../host";
import { StatusLabel } from "../../../../Components/Label";
import { TableBodySkeleton } from "./Skeleton";
import BarChart from "../../../../Components/Charts/BarChart";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

import { Pagination } from "../../../Infrastructure/components/TablePagination";

const MonitorTable = ({ isAdmin, filter, setIsSearching, isSearching, handlePause }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { determineState } = useUtils();

	const { rowsPerPage } = useSelector((state) => state.ui.monitors);
	const authState = useSelector((state) => state.auth);

	const [page, setPage] = useState(0);
	const [monitors, setMonitors] = useState([]);
	const [monitorCount, setMonitorCount] = useState(0);
	const [updateTrigger, setUpdateTrigger] = useState(false);
	const [sort, setSort] = useState({});
	const prevFilter = useRef(filter);

	const handleRowUpdate = () => {
		setUpdateTrigger((prev) => !prev);
	};

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

	const fetchPage = useCallback(async () => {
		try {
			const { authToken } = authState;
			const user = jwtDecode(authToken);
			const res = await networkService.getMonitorsByTeamId({
				authToken,
				teamId: user.teamId,
				limit: 25,
				types: ["http", "ping", "docker"],
				status: null,
				checkOrder: "desc",
				normalize: true,
				page: page,
				rowsPerPage: rowsPerPage,
				filter: filter,
				field: sort.field,
				order: sort.order,
			});
			setMonitors(res?.data?.data?.monitors ?? []);
			setMonitorCount(res?.data?.data?.monitorCount ?? 0);
		} catch (error) {
			logger.error(error);
		} finally {
			setIsSearching(false);
		}
	}, [authState, page, rowsPerPage, filter, sort, setIsSearching]);

	useEffect(() => {
		fetchPage();
	}, [
		updateTrigger,
		authState,
		page,
		rowsPerPage,
		filter,
		sort,
		setIsSearching,
		fetchPage,
	]);

	// Listen for changes in filter, if new value reset the page
	useEffect(() => {
		if (prevFilter.current !== filter) {
			setPage(0);
			fetchPage();
		}
		prevFilter.current = filter;
	}, [filter, fetchPage]);

	const handleSort = async (field) => {
		let order = "";
		if (sort.field !== field) {
			order = "desc";
		} else {
			order = sort.order === "asc" ? "desc" : "asc";
		}
		setSort({ field, order });

		const { authToken } = authState;
		const user = jwtDecode(authToken);

		const res = await networkService.getMonitorsByTeamId({
			authToken,
			teamId: user.teamId,
			limit: 25,
			types: ["http", "ping"],
			status: null,
			checkOrder: "desc",
			normalize: true,
			page: page,
			rowsPerPage: rowsPerPage,
			filter: null,
			field: field,
			order: order,
		});
		setMonitors(res?.data?.data?.monitors ?? []);
		setMonitorCount(res?.data?.data?.monitorCount ?? 0);
	};
	/* TODO Apply component basic table? */
	return (
		<Box position="relative">
			{isSearching && (
				<>
					<Box
						width="100%"
						height="100%"
						position="absolute"
						sx={{
							backgroundColor: theme.palette.background.main,
							opacity: 0.8,
							zIndex: 100,
						}}
					/>
					<Box
						height="100%"
						position="absolute"
						top="20%"
						left="50%"
						sx={{
							transform: "translateX(-50%)",
							zIndex: 101,
						}}
					>
						<CircularProgress
							sx={{
								color: theme.palette.other.icon,
							}}
						/>
					</Box>
				</>
			)}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("name")}
							>
								<Box>
									Host
									<span
										style={{
											visibility: sort.field === "name" ? "visible" : "hidden",
										}}
									>
										{sort.order === "asc" ? (
											<ArrowUpwardRoundedIcon />
										) : (
											<ArrowDownwardRoundedIcon />
										)}
									</span>
								</Box>
							</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("status")}
							>
								{" "}
								<Box width="max-content">
									{" "}
									Status
									<span
										style={{
											visibility: sort.field === "status" ? "visible" : "hidden",
										}}
									>
										{sort.order === "asc" ? (
											<ArrowUpwardRoundedIcon />
										) : (
											<ArrowDownwardRoundedIcon />
										)}
									</span>
								</Box>
							</TableCell>
							<TableCell>Response Time</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{/* TODO add empty state. Check if is searching, and empty => skeleton. Is empty, not searching => skeleton */}
						{monitors.length > 0 ? (
							monitors.map((monitor) => {
								let uptimePercentage = "";
								let percentageColor = theme.palette.percentage.uptimeExcellent;

								// Determine uptime percentage and color based on the monitor's uptimePercentage value
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

								const params = {
									url: monitor.url,
									title: monitor.name,
									percentage: uptimePercentage,
									percentageColor,
									status: determineState(monitor),
								};

								return (
									<TableRow
										key={monitor._id}
										sx={{
											cursor: "pointer",
											"&:hover": {
												filter: "brightness(.75)",
												opacity: 0.75,
												transition: "filter 0.3s ease, opacity 0.3s ease",
											},
										}}
										onClick={() => {
											navigate(`/uptime/${monitor._id}`);
										}}
									>
										<TableCell>
											<Host
												key={monitor._id}
												url={params.url}
												title={params.title}
												percentageColor={params.percentageColor}
												percentage={params.percentage}
											/>
										</TableCell>
										<TableCell>
											<StatusLabel
												status={params.status}
												text={params.status}
												customStyles={{ textTransform: "capitalize" }}
											/>
										</TableCell>
										<TableCell>
											<BarChart checks={monitor.checks.slice().reverse()} />
										</TableCell>
										<TableCell>
											<span style={{ textTransform: "uppercase" }}>{monitor.type}</span>
										</TableCell>
										<TableCell>
											<ActionsMenu
												monitor={monitor}
												isAdmin={isAdmin}
												updateRowCallback={handleRowUpdate}
												pauseCallback={handlePause}
											/>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableBodySkeleton />
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<Pagination
				monitorCount={monitorCount}
				page={page}
				rowsPerPage={rowsPerPage}
				handleChangePage={handleChangePage}
				handleChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</Box>
	);
};

MonitorTable.propTypes = {
	isAdmin: PropTypes.bool,
	filter: PropTypes.string,
	setIsSearching: PropTypes.func,
	isSearching: PropTypes.bool,
	setMonitorUpdateTrigger: PropTypes.func,
	handlePause: PropTypes.func,
};

const MemoizedMonitorTable = memo(MonitorTable);
export default MemoizedMonitorTable;
