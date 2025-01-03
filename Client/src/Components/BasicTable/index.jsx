import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import {
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TablePagination,
	Box,
	Typography,
	Stack,
	Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setRowsPerPage } from "../../Features/UI/uiSlice";
import LeftArrowDouble from "../../assets/icons/left-arrow-double.svg?react";
import RightArrowDouble from "../../assets/icons/right-arrow-double.svg?react";
import LeftArrow from "../../assets/icons/left-arrow.svg?react";
import RightArrow from "../../assets/icons/right-arrow.svg?react";
import SelectorVertical from "../../assets/icons/selector-vertical.svg?react";
import "./index.css";
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

/**
 * BasicTable Component
 * Renders a table with optional pagination.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.data - Data for the table including columns and rows.
 *   @param {Array} props.data.cols - Array of objects for column headers.
 *     @param {number} props.data.cols[].id - Unique identifier for the column.
 *     @param {string} props.data.cols[].name - Name of the column to display as header.
 *   @param {Array} props.data.rows - Array of row objects.
 *     @param {number} props.data.rows[].id - Unique identifier for the row.
 *     @param {Array} props.data.rows[].data - Array of cell data objects for the row.
 *       @param {number} props.data.rows[].data[].id - Unique identifier for the cell.
 *       @param {JSX.Element} props.data.rows[].data[].data - The content to display in the cell.
 *       @param {function} props.data.rows.data.handleClick - Function to call when the row is clicked.
 * @param {boolean} [props.paginated=false] - Flag to enable pagination.
 * @param {boolean} [props.reversed=false] - Flag to enable reverse order.
 * @param {number} props.rowsPerPage- Number of rows per page (table).
 * @param {string} props.emptyMessage - Message to display when there is no data.
 * @example
 * const data = {
 *   cols: [
 *     { id: 1, name: "First Col" },
 *     { id: 2, name: "Second Col" },
 *     { id: 3, name: "Third Col" },
 *     { id: 4, name: "Fourth Col" },
 *   ],
 *   rows: [
 *     {
 *       id: 1,
 *       data: [
 *         { id: 1, data: <div>Data for Row 1 Col 1</div> },
 *         { id: 2, data: <div>Data for Row 1 Col 2</div> },
 *         { id: 3, data: <div>Data for Row 1 Col 3</div> },
 *         { id: 4, data: <div>Data for Row 1 Col 4</div> },
 *       ],
 *     },
 *     {
 *       id: 2,
 *       data: [
 *         { id: 5, data: <div>Data for Row 2 Col 1</div> },
 *         { id: 6, data: <div>Data for Row 2 Col 2</div> },
 *         { id: 7, data: <div>Data for Row 2 Col 3</div> },
 *         { id: 8, data: <div>Data for Row 2 Col 4</div> },
 *       ],
 *     },
 *   ],
 * };
 *
 * <BasicTable data={data} rows={rows} paginated={true} />
 */

const BasicTable = ({ data, paginated, reversed, table, emptyMessage = "No data" }) => {
	const DEFAULT_ROWS_PER_PAGE = 5;
	const theme = useTheme();
	const dispatch = useDispatch();
	const uiState = useSelector((state) => state.ui);
	let rowsPerPage = uiState?.[table]?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE;
	const [page, setPage] = useState(0);

	useEffect(() => {
		setPage(0);
	}, [data]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		dispatch(
			setRowsPerPage({
				value: parseInt(event.target.value, 10),
				table: table,
			})
		);
		setPage(0);
	};

	let displayData = [];

	if (data && data.rows) {
		let rows = reversed ? [...data.rows].reverse() : data.rows;
		displayData = paginated
			? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			: rows;
	}

	if (!data || !data.cols || !data.rows) {
		return <div>No data</div>;
	}

	/**
	 * Helper function to calculate the range of displayed rows.
	 * @returns {string}
	 */
	const getRange = () => {
		let start = page * rowsPerPage + 1;
		let end = Math.min(page * rowsPerPage + rowsPerPage, data.rows.length);
		return `${start} - ${end}`;
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{data.cols.map((col) => (
								<TableCell key={col.id}>{col.name}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{displayData.map((row) => {
							return (
								<TableRow
									sx={{
										cursor: row.handleClick ? "pointer" : "default",
										"&:hover": {
											filter: "brightness(.75)",
											opacity: 0.75,
											transition: "filter 0.3s ease, opacity 0.3s ease",
										},
									}}
									key={row.id}
									onClick={row.handleClick ? row.handleClick : null}
								>
									{row.data.map((cell) => {
										return <TableCell key={cell.id}>{cell.data}</TableCell>;
									})}
								</TableRow>
							);
						})}
						{displayData.length === 0 && (
							<TableRow>
								<TableCell
									sx={{ textAlign: "center" }}
									colSpan={data.cols.length}
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{paginated && (
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					px={theme.spacing(4)}
					sx={{
						"& p": {
							color: theme.palette.text.tertiary,
						},
					}}
				>
					<Typography
						px={theme.spacing(2)}
						fontSize={12}
						sx={{ opacity: 0.7 }}
					>
						Showing {getRange()} of {data.rows.length} monitor(s)
					</Typography>
					<TablePagination
						component="div"
						count={data.rows.length}
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
							color: theme.palette.text.secondary,
							"& svg path": {
								stroke: theme.palette.text.tertiary,
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
			)}
		</>
	);
};

BasicTable.propTypes = {
	data: PropTypes.object.isRequired,
	paginated: PropTypes.bool,
	reversed: PropTypes.bool,
	rowPerPage: PropTypes.number,
	table: PropTypes.string,
	emptyMessage: PropTypes.string,
};

export default BasicTable;
