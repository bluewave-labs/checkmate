import PropTypes from "prop-types";
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Pagination,
	PaginationItem,
	Paper,
	Typography,
	Box,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
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

const IncidentTable = ({ monitors, selectedMonitor, filter }) => {
	const uiTimezone = useSelector((state) => state.ui.timezone);

	const theme = useTheme();
	const { authToken, user } = useSelector((state) => state.auth);
	const mode = useSelector((state) => state.ui.mode);
	const [checks, setChecks] = useState([]);
	const [checksCount, setChecksCount] = useState(0);
	const [paginationController, setPaginationController] = useState({
		page: 0,
		rowsPerPage: 14,
	});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setPaginationController((prevPaginationController) => ({
			...prevPaginationController,
			page: 0,
		}));
	}, [filter, selectedMonitor]);

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
						page: paginationController.page,
						rowsPerPage: paginationController.rowsPerPage,
					});
				} else {
					res = await networkService.getChecksByMonitor({
						authToken: authToken,
						monitorId: selectedMonitor,
						sortOrder: "desc",
						limit: null,
						dateRange: null,
						filter: filter,
						page: paginationController.page,
						rowsPerPage: paginationController.rowsPerPage,
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
	}, [
		authToken,
		user,
		monitors,
		selectedMonitor,
		filter,
		paginationController.page,
		paginationController.rowsPerPage,
	]);

	const handlePageChange = (_, newPage) => {
		setPaginationController({
			...paginationController,
			page: newPage - 1, // 0-indexed
		});
	};

	let paginationComponent = <></>;
	if (checksCount > paginationController.rowsPerPage) {
		paginationComponent = (
			<Pagination
				count={Math.ceil(checksCount / paginationController.rowsPerPage)}
				page={paginationController.page + 1} //0-indexed
				onChange={handlePageChange}
				shape="rounded"
				renderItem={(item) => (
					<PaginationItem
						slots={{
							previous: ArrowBackRoundedIcon,
							next: ArrowForwardRoundedIcon,
						}}
						{...item}
					/>
				)}
				sx={{ mt: "auto" }}
			/>
		);
	}

	let sharedStyles = {
		border: 1,
		borderColor: theme.palette.primary.lowContrast,
		borderRadius: theme.shape.borderRadius,
		backgroundColor: theme.palette.background.main,
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
						color={theme.palette.primary.contrastText.secondary}
					>
						The monitor you have selected has no recorded incidents yet.
					</Typography>
				</Box>
			) : (
				<>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Monitor Name</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>Date & Time</TableCell>
									<TableCell>Status Code</TableCell>
									<TableCell>Message</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{checks.map((check) => {
									const status = check.status === true ? "up" : "down";
									const formattedDate = formatDateWithTz(
										check.createdAt,
										"YYYY-MM-DD HH:mm:ss A",
										uiTimezone
									);

									return (
										<TableRow key={check._id}>
											<TableCell>{monitors[check.monitorId]?.name}</TableCell>
											<TableCell>
												<StatusLabel
													status={status}
													text={status}
													customStyles={{ textTransform: "capitalize" }}
												/>
											</TableCell>
											<TableCell>{formattedDate}</TableCell>
											<TableCell>
												<HttpStatusLabel status={check.statusCode} />
											</TableCell>
											<TableCell>{check.message}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
					{paginationComponent}
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
