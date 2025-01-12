import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";

/**
 * @typedef {Object} Header
 * @property {number|string} id - The unique identifier for the header.
 * @property {React.ReactNode} content - The content to display in the header cell.
 * @property {Function} render - A function to render the cell content for a given row.
 */

/**
 * @typedef {Object} Config
 * @property {Function} onRowClick - A function to be called when a row is clicked, receiving the row data as an argument.
 * @property {Object} rowSX - Style object for the table row.
 */

/**
 * DataTable component renders a table with headers and data.
 *
 * @param {Object} props - The component props.
 * @param {Header[]} props.headers - An array of header objects, each containing an `id`, `content`, and `render` function.
 * @param {Array} props.data - An array of data objects, each representing a row.
 * @returns {JSX.Element} The rendered table component.
 */

const DataTable = ({ headers, data, config = { emptyView: "No data" } }) => {
	const theme = useTheme();
	if ((headers?.length ?? 0) === 0) {
		return "No data";
	}

	return (
		<TableContainer component={Paper}>
			<Table
				stickyHeader
				sx={{
					"& :is(th)": { color: theme.palette.primary.contrastText },
					"& :is(td)": { color: theme.palette.primary.contrastTextSecondary },
				}}
			>
				<TableHead sx={{ backgroundColor: theme.palette.background.accent }}>
					<TableRow>
						{headers.map((header, index) => (
							<TableCell
								key={header.id}
								align={index === 0 ? "left" : "center"}
							>
								{header.content}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{(data?.length ?? 0) === 0 ? (
						<TableRow>
							<TableCell
								colSpan={headers.length}
								align="center"
							>
								{config.emptyView}
							</TableCell>
						</TableRow>
					) : (
						data.map((row) => {
							return (
								<TableRow
									key={row.id}
									sx={config?.rowSX ?? {}}
									onClick={() => config?.onRowClick(row)}
								>
									{headers.map((header, index) => {
										return (
											<TableCell
												align={index === 0 ? "left" : "center"}
												key={header.id}
											>
												{header.render(row)}
											</TableCell>
										);
									})}
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

DataTable.propTypes = {
	headers: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
			content: PropTypes.node.isRequired,
			render: PropTypes.func.isRequired,
		})
	).isRequired,
	data: PropTypes.array.isRequired,
	config: PropTypes.shape({
		onRowClick: PropTypes.func.isRequired,
		rowSX: PropTypes.object,
		emptyView: PropTypes.node,
	}),
};

export default DataTable;
