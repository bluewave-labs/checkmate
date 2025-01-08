import PropTypes from "prop-types";
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Box,
	TablePagination,
	Stack,
	Typography,
	Button,
} from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ActionsMenu from "./ActionsMenu";
import { useState, useEffect, memo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import LeftArrowDouble from "../../../assets/icons/left-arrow-double.svg?react";
import RightArrowDouble from "../../../assets/icons/right-arrow-double.svg?react";
import LeftArrow from "../../../assets/icons/left-arrow.svg?react";
import RightArrow from "../../../assets/icons/right-arrow.svg?react";
import SelectorVertical from "../../../assets/icons/selector-vertical.svg?react";
import { formatDurationRounded } from "../../../Utils/timeUtils";
import { StatusLabel } from "../../../Components/Label";
import { setRowsPerPage } from "../../../Features/UI/uiSlice";
import dayjs from "dayjs";

/**
 * Component for pagination actions (first, previous, next, last).
 *
 * @component
 * @param {Object} props
 * @param {number} props.count - Total number of items.
 * @param {number} props.page - Current page number.
 * @param {number} props.rowsPerPage - Number of rows per page.
 * @param {function} props.onPageChange - Callback function to handle page change.
 *
 * @returns {JSX.Element} Pagination actions component.
 */
const TablePaginationActions = (props) => {
	const { count, page, rowsPerPage, onPageChange } = props;
	const handleFirstPageButtonClick = (event) => {
		onPageChange(event, 0);
	};
	const handleBackButtonClick = (event) => {
		onPageChange(event, page - 1);
	};
	const handleNextButtonClick = (event) => {
		onPageChange(event, page + 1);
	};
	const handleLastPageButtonClick = (event) => {
		onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};

	return (
		<Box sx={{ flexShrink: 0, ml: "24px" }}>
			<Button
				variant="group"
				onClick={handleFirstPageButtonClick}
				disabled={page === 0}
				aria-label="first page"
			>
				<LeftArrowDouble />
			</Button>
			<Button
				variant="group"
				onClick={handleBackButtonClick}
				disabled={page === 0}
				aria-label="previous page"
			>
				<LeftArrow />
			</Button>
			<Button
				variant="group"
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="next page"
			>
				<RightArrow />
			</Button>
			<Button
				variant="group"
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="last page"
			>
				<RightArrowDouble />
			</Button>
		</Box>
	);
};

TablePaginationActions.propTypes = {
	count: PropTypes.number.isRequired,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
	onPageChange: PropTypes.func.isRequired,
};

const MaintenanceTable = ({
	page,
	setPage,
	sort,
	setSort,
	maintenanceWindows,
	maintenanceWindowCount,
	updateCallback,
}) => {
	const { rowsPerPage } = useSelector((state) => state.ui.maintenance);
	const theme = useTheme();
	const dispatch = useDispatch();

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const getTimeToNextWindow = (startTime, endTime, repeat) => {
		//1.  Advance time closest to next window as possible
		const now = dayjs();
		let start = dayjs(startTime);
		let end = dayjs(endTime);
		if (repeat > 0) {
			// Advance time closest to next window as possible
			while (start.isBefore(now) && end.isBefore(now)) {
				start = start.add(repeat, "milliseconds");
				end = end.add(repeat, "milliseconds");
			}
		}

		//Check if we are in a window
		if (now.isAfter(start) && now.isBefore(end)) {
			return "In maintenance window";
		}

		if (start.isAfter(now)) {
			const diffInMinutes = start.diff(now, "minutes");
			const diffInHours = start.diff(now, "hours");
			const diffInDays = start.diff(now, "days");

			if (diffInMinutes < 60) {
				return diffInMinutes + " minutes";
			} else if (diffInHours < 24) {
				return diffInHours + " hours";
			} else if (diffInDays < 7) {
				return diffInDays + " days";
			} else {
				return diffInDays + " days";
			}
		}
	};

	const handleChangeRowsPerPage = (event) => {
		dispatch(
			setRowsPerPage({
				value: parseInt(event.target.value, 10),
				table: "maintenance",
			})
		);
		setPage(0);
	};

	/**
	 * Helper function to calculate the range of displayed rows.
	 * @returns {string}
	 */
	const getRange = () => {
		let start = page * rowsPerPage + 1;
		let end = Math.min(page * rowsPerPage + rowsPerPage, maintenanceWindowCount);
		return `${start} - ${end}`;
	};

	const handleSort = async (field) => {
		let order = "";
		if (sort.field !== field) {
			order = "desc";
		} else {
			order = sort.order === "asc" ? "desc" : "asc";
		}
		setSort({ field, order });
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("name")}
							>
								<Box>
									Maintenance Window Name
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
											visibility: sort.field === "active" ? "visible" : "hidden",
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
							<TableCell>Next Window</TableCell>
							<TableCell>Repeat</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{maintenanceWindows.map((maintenanceWindow) => {
							const text = maintenanceWindow.active ? "active" : "paused";
							const status = maintenanceWindow.active ? "up" : "paused";
							return (
								<TableRow key={maintenanceWindow._id}>
									<TableCell>{maintenanceWindow.name}</TableCell>
									<TableCell>
										<StatusLabel
											status={status}
											text={text}
											customStyles={{ textTransform: "capitalize" }}
										/>
									</TableCell>
									<TableCell>
										{getTimeToNextWindow(
											maintenanceWindow.start,
											maintenanceWindow.end,
											maintenanceWindow.repeat
										)}
									</TableCell>
									<TableCell>
										{maintenanceWindow.repeat === 0
											? "N/A"
											: formatDurationRounded(maintenanceWindow.repeat)}
									</TableCell>
									<TableCell>
										<ActionsMenu
											maintenanceWindow={maintenanceWindow}
											updateCallback={updateCallback}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				px={theme.spacing(4)}
			>
				<Typography
					px={theme.spacing(2)}
					variant="body2"
					sx={{ opacity: 0.7 }}
				>
					Showing {getRange()} of {maintenanceWindowCount} maintenance window(s)
				</Typography>
				<TablePagination
					component="div"
					count={maintenanceWindowCount}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[5, 10, 15, 25]}
					onRowsPerPageChange={handleChangeRowsPerPage}
					ActionsComponent={TablePaginationActions}
					labelRowsPerPage="Rows per page"
					labelDisplayedRows={({ page, count }) =>
						`Page ${page + 1} of ${Math.max(0, Math.ceil(count / rowsPerPage))}`
					}
					slotProps={{
						select: {
							MenuProps: {
								keepMounted: true,
								disableScrollLock: true,
								PaperProps: {
									className: "pagination-dropdown",
									sx: {
										mt: 0,
										mb: theme.spacing(2),
									},
								},
								transformOrigin: { vertical: "bottom", horizontal: "left" },
								anchorOrigin: { vertical: "top", horizontal: "left" },
								sx: { mt: theme.spacing(-2) },
							},
							inputProps: { id: "pagination-dropdown" },
							IconComponent: SelectorVertical,
							sx: {
								ml: theme.spacing(4),
								mr: theme.spacing(12),
								minWidth: theme.spacing(20),
								textAlign: "left",
								"&.Mui-focused > div": {
									backgroundColor: theme.palette.background.main,
								},
							},
						},
					}}
					sx={{
						mt: theme.spacing(6),
						color: theme.palette.primary.contrastText.secondary,
						"& svg path": {
							stroke: theme.palette.primary.contrastText.tertiary,
							strokeWidth: 1.3,
						},
						"& .MuiSelect-select": {
							border: 1,
							borderColor: theme.palette.border.light,
							borderRadius: theme.shape.borderRadius,
						},
					}}
				/>
			</Stack>
		</>
	);
};

MaintenanceTable.propTypes = {
	isAdmin: PropTypes.bool,
	page: PropTypes.number,
	setPage: PropTypes.func,
	rowsPerPage: PropTypes.number,
	setRowsPerPage: PropTypes.func,
	sort: PropTypes.object,
	setSort: PropTypes.func,
	maintenanceWindows: PropTypes.array,
	maintenanceWindowCount: PropTypes.number,
	updateCallback: PropTypes.func,
};

const MemoizedMaintenanceTable = memo(MaintenanceTable);
export default MemoizedMaintenanceTable;
