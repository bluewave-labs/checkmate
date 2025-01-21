import PropTypes from "prop-types";
import { Typography, Box } from "@mui/material";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { networkService } from "../../../main";
import { StatusLabel } from "../../../Components/Label";
import { logger } from "../../../Utils/Logger";
import { useTheme } from "@emotion/react";
import { formatDateWithTz } from "../../../Utils/timeUtils";
import PlaceholderLight from "../../../assets/Images/data_placeholder.svg?react";
import PlaceholderDark from "../../../assets/Images/data_placeholder_dark.svg?react";
import { HttpStatusLabel } from "../../../Components/HttpStatusLabel";
import { Empty } from "./Empty/Empty";
import { IncidentSkeleton } from "./Skeleton/Skeleton";
import DataTable from "../../../Components/Table";
import Pagination from "../../../Components/Table/TablePagination";
const IncidentTable = ({ monitors, selectedMonitor, filter }) => {
	const uiTimezone = useSelector((state) => state.ui.timezone);

	const theme = useTheme();
	const { authToken, user } = useSelector((state) => state.auth);
	const mode = useSelector((state) => state.ui.mode);
	const [checks, setChecks] = useState([]);
	const [checksCount, setChecksCount] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchPage = async () => {
			if (!monitors || Object.keys(monitors).length === 0) {
				return;
			}
			try {
				setIsLoading(true);
				let res;
				if (selectedMonitor === "0") {
					res = await networkService.getChecksByTeam({
						authToken: authToken,
						teamId: user.teamId,
						sortOrder: "desc",
						limit: null,
						dateRange: null,
						filter: filter,
						page: page,
						rowsPerPage: rowsPerPage,
					});
				} else {
					res = await networkService.getChecksByMonitor({
						authToken: authToken,
						monitorId: selectedMonitor,
						sortOrder: "desc",
						limit: null,
						dateRange: null,
						filter: filter,
						page,
						rowsPerPage,
					});
				}
				setChecks(res.data.data.checks);
				setChecksCount(res.data.data.checksCount);
			} catch (error) {
				logger.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPage();
	}, [authToken, user, monitors, selectedMonitor, filter, page, rowsPerPage]);

	const handlePageChange = (_, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(event.target.value);
	};

	const headers = [
		{
			id: "monitorName",
			content: "Monitor Name",
			render: (row) => monitors[row.monitorId]?.name ?? "N/A",
		},
		{
			id: "status",
			content: "Status",
			render: (row) => {
				const status = row.status === true ? "up" : "down";
				return (
					<StatusLabel
						status={status}
						text={status}
						customStyles={{ textTransform: "capitalize" }}
					/>
				);
			},
		},
		{
			id: "dateTime",
			content: "Date & Time",
			render: (row) => {
				const formattedDate = formatDateWithTz(
					row.createdAt,
					"YYYY-MM-DD HH:mm:ss A",
					uiTimezone
				);
				return formattedDate;
			},
		},
		{
			id: "statusCode",
			content: "Status Code",
			render: (row) => <HttpStatusLabel status={row.statusCode} />,
		},
		{ id: "message", content: "Message", render: (row) => row.message },
	];

	let sharedStyles = {
		border: 1,
		borderColor: theme.palette.primary.lowContrast,
		borderRadius: theme.shape.borderRadius,
		backgroundColor: theme.palette.primary.main,
		p: theme.spacing(30),
	};

	const hasChecks = checks?.length === 0;
	const noIncidentsRecordedYet = hasChecks && selectedMonitor === "0";
	const noIncidentsForThatMonitor = hasChecks && selectedMonitor !== "0";

	return (
		<>
			{isLoading ? (
				<IncidentSkeleton />
			) : noIncidentsRecordedYet ? (
				<Empty
					mode={mode}
					styles={sharedStyles}
				/>
			) : noIncidentsForThatMonitor ? (
				<Box sx={{ ...sharedStyles }}>
					<Box
						textAlign="center"
						pb={theme.spacing(20)}
					>
						{mode === "light" ? <PlaceholderLight /> : <PlaceholderDark />}
					</Box>
					<Typography
						textAlign="center"
						color={theme.palette.primary.contrastTextSecondary}
					>
						The monitor you have selected has no recorded incidents yet.
					</Typography>
				</Box>
			) : (
				<>
					<DataTable
						headers={headers}
						data={checks}
					/>
					<Pagination
						paginationLabel="incidents"
						itemCount={checksCount}
						page={page}
						rowsPerPage={rowsPerPage}
						handleChangePage={handlePageChange}
						handleChangeRowsPerPage={handleChangeRowsPerPage}
					/>
				</>
			)}
		</>
	);
};

IncidentTable.propTypes = {
	monitors: PropTypes.object.isRequired,
	selectedMonitor: PropTypes.string.isRequired,
	filter: PropTypes.string.isRequired,
};

export default IncidentTable;
