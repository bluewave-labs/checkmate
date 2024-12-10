import PropTypes from "prop-types";
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	PaginationItem,
	Pagination,
	Paper,
} from "@mui/material";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { networkService } from "../../../../main";
import { StatusLabel } from "../../../../Components/Label";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { logger } from "../../../../Utils/Logger";
import { formatDateWithTz } from "../../../../Utils/timeUtils";

const PaginationTable = ({ monitorId, dateRange }) => {
	const { authToken } = useSelector((state) => state.auth);
	const [checks, setChecks] = useState([]);
	const [checksCount, setChecksCount] = useState(0);
	const [paginationController, setPaginationController] = useState({
		page: 0,
		rowsPerPage: 5,
	});
	const uiTimezone = useSelector((state) => state.ui.timezone);

	useEffect(() => {
		setPaginationController((prevPaginationController) => ({
			...prevPaginationController,
			page: 0,
		}));
	}, [dateRange]);

	useEffect(() => {
		const fetchPage = async () => {
			try {
				const res = await networkService.getChecksByMonitor({
					authToken: authToken,
					monitorId: monitorId,
					sortOrder: "desc",
					limit: null,
					dateRange: dateRange,
					filter: null,
					page: paginationController.page,
					rowsPerPage: paginationController.rowsPerPage,
				});
				setChecks(res.data.data.checks);
				setChecksCount(res.data.data.checksCount);
			} catch (error) {
				logger.error(error);
			}
		};
		fetchPage();
	}, [
		authToken,
		monitorId,
		dateRange,
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
			/>
		);
	}

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Status</TableCell>
							<TableCell>Date & Time</TableCell>
							<TableCell>Status Code</TableCell>
							<TableCell>Message</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{checks.map((check) => {
							const status = check.status === true ? "up" : "down";

							return (
								<TableRow key={check._id}>
									<TableCell>
										<StatusLabel
											status={status}
											text={status}
											customStyles={{ textTransform: "capitalize" }}
										/>
									</TableCell>
									<TableCell>
										{formatDateWithTz(
											check.createdAt,
											"ddd, MMMM D, YYYY, HH:mm A",
											uiTimezone
										)}
									</TableCell>
									<TableCell>{check.statusCode ? check.statusCode : "N/A"}</TableCell>
									<TableCell>{check.message}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			{paginationComponent}
		</>
	);
};

PaginationTable.propTypes = {
	monitorId: PropTypes.string.isRequired,
	dateRange: PropTypes.string.isRequired,
};

export default PaginationTable;
