// Components
import { Box, Stack, CircularProgress } from "@mui/material";
import Search from "../../../../Components/Inputs/Search";
import { Heading } from "../../../../Components/Heading";
import DataTable from "../../../../Components/Table";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import Host from "../host";
import { StatusLabel } from "../../../../Components/Label";
import BarChart from "../../../../Components/Charts/BarChart";
import ActionsMenu from "../actionsMenu";

// Utils
import { useTheme } from "@emotion/react";
import useUtils from "../../utils";
import { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import PropTypes from "prop-types";

const SearchComponent = memo(
	({ monitors, debouncedSearch, onSearchChange, setIsSearching }) => {
		const [localSearch, setLocalSearch] = useState(debouncedSearch);
		const handleSearch = useCallback(
			(value) => {
				setIsSearching(true);
				setLocalSearch(value);
				onSearchChange(value);
			},
			[onSearchChange, setIsSearching]
		);

		return (
			<Box
				width="25%"
				minWidth={150}
				ml="auto"
			>
				<Search
					options={monitors}
					filteredBy="name"
					inputValue={localSearch}
					handleInputChange={handleSearch}
				/>
			</Box>
		);
	}
);
SearchComponent.displayName = "SearchComponent";
SearchComponent.propTypes = {
	monitors: PropTypes.array,
	debouncedSearch: PropTypes.string,
	onSearchChange: PropTypes.func,
	setIsSearching: PropTypes.func,
};

/**
 * UptimeDataTable displays a table of uptime monitors with sorting, searching, and action capabilities
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether the current user has admin privileges
 * @param {boolean} props.isLoading - Loading state of the table
 * @param {Array<{
 *   _id: string,
 *   url: string,
 *   title: string,
 *   percentage: number,
 *   percentageColor: string,
 *   monitor: {
 *     _id: string,
 *     type: string,
 *     checks: Array
 *   }
 * }>} props.monitors - Array of monitor objects to display
 * @param {number} props.monitorCount - Total count of monitors
 * @param {Object} props.sort - Current sort configuration
 * @param {string} props.sort.field - Field to sort by
 * @param {'asc'|'desc'} props.sort.order - Sort direction
 * @param {Function} props.setSort - Callback to update sort configuration
 * @param {string} props.search - Current search query
 * @param {Function} props.setSearch - Callback to update search query
 * @param {boolean} props.isSearching - Whether a search is in progress
 * @param {Function} props.setIsSearching - Callback to update search state
 * @param {Function} props.setIsLoading - Callback to update loading state
 * @param {Function} props.triggerUpdate - Callback to trigger a data refresh
 * @returns {JSX.Element} Rendered component
 */
const UptimeDataTable = ({
	isAdmin,
	isLoading,
	monitors,
	filteredMonitors,
	monitorCount,
	sort,
	setSort,
	debouncedSearch,
	setSearch,
	isSearching,
	setIsSearching,
	setIsLoading,
	triggerUpdate,
}) => {
	const { determineState } = useUtils();

	const theme = useTheme();
	const navigate = useNavigate();

	const handleSort = (field) => {
		let order = "";
		if (sort.field !== field) {
			order = "desc";
		} else {
			order = sort.order === "asc" ? "desc" : "asc";
		}
		setSort({ field, order });
	};

	const headers = [
		{
			id: "name",
			content: (
				<Stack
					gap={theme.spacing(4)}
					alignItems="center"
					direction="row"
					onClick={() => handleSort("name")}
				>
					Host
					<Stack
						justifyContent="center"
						style={{
							visibility: sort.field === "name" ? "visible" : "hidden",
						}}
					>
						{sort.order === "asc" ? (
							<ArrowUpwardRoundedIcon />
						) : (
							<ArrowDownwardRoundedIcon />
						)}
					</Stack>
				</Stack>
			),
			render: (row) => (
				<Host
					key={row._id}
					url={row.url}
					title={row.title}
					percentageColor={row.percentageColor}
					percentage={row.percentage}
				/>
			),
		},
		{
			id: "status",
			content: (
				<Stack
					direction="row"
					gap={theme.spacing(4)}
					alignItems="center"
					display={"inline-flex"}
					onClick={() => handleSort("status")}
				>
					{" "}
					Status
					<Stack
						justifyContent="center"
						style={{
							visibility: sort.field === "status" ? "visible" : "hidden",
						}}
					>
						{sort.order === "asc" ? (
							<ArrowUpwardRoundedIcon fontSize="18px" />
						) : (
							<ArrowDownwardRoundedIcon fontSize="18px" />
						)}
					</Stack>
				</Stack>
			),
			render: (row) => {
				const status = determineState(row.monitor);
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
			id: "responseTime",
			content: "Response Time",
			render: (row) => <BarChart checks={row.monitor.checks.slice().reverse()} />,
		},
		{
			id: "type",
			content: "Type",
			render: (row) => (
				<span style={{ textTransform: "uppercase" }}>{row.monitor.type}</span>
			),
		},
		{
			id: "actions",
			content: "Actions",
			render: (row) => (
				<ActionsMenu
					monitor={row.monitor}
					isAdmin={isAdmin}
					updateRowCallback={triggerUpdate}
					setIsLoading={setIsLoading}
					pauseCallback={triggerUpdate}
				/>
			),
		},
	];

	return (
		<Box
			flex={1}
			py={theme.spacing(8)}
		>
			<Stack
				direction="row"
				alignItems="center"
				mb={theme.spacing(8)}
				gap={theme.spacing(2)}
			>
				<Heading component="h2">Uptime monitors</Heading>

				<Box
					className="current-monitors-counter"
					color={theme.palette.tertiary.contrastText}
					border={2}
					borderColor={theme.palette.accent.main}
					backgroundColor={theme.palette.tertiary.main}
					sx={{
						padding: ".25em .75em",
						borderRadius: "50%",
						fontSize: "12px",
						fontWeight: 500,
					}}
				>
					{monitorCount}
				</Box>

				<SearchComponent
					monitors={monitors}
					debouncedSearch={debouncedSearch}
					onSearchChange={setSearch}
					setIsSearching={setIsSearching}
				/>
			</Stack>
			<Box position="relative">
				{(isSearching || isLoading) && (
					<>
						<Box
							width="100%"
							height="100%"
							position="absolute"
							sx={{
								backgroundColor: theme.palette.accent.contrastText,
								opacity: 0.8,
								zIndex: 100,
							}}
						/>
						<Box
							height="100%"
							position="absolute"
							top="50%"
							left="50%"
							sx={{
								transform: "translateX(-50%)",
								zIndex: 101,
							}}
						>
							<CircularProgress
								sx={{
									color: theme.palette.accent.main,
								}}
							/>
						</Box>
					</>
				)}
				<DataTable
					headers={headers}
					data={filteredMonitors}
					config={{
						rowSX: {
							cursor: "pointer",
							"&:hover td": {
								backgroundColor: theme.palette.tertiary.main,
							},
						},
						onRowClick: (row) => {
							navigate(`/uptime/${row.id}`);
						},
						emptyView: "No monitors found",
					}}
				/>
			</Box>
		</Box>
	);
};

const MemoizedUptimeDataTable = memo(UptimeDataTable);
export default MemoizedUptimeDataTable;

UptimeDataTable.propTypes = {
	isAdmin: PropTypes.bool,
	isLoading: PropTypes.bool,
	monitors: PropTypes.array,
	filteredMonitors: PropTypes.array,
	monitorCount: PropTypes.number,
	sort: PropTypes.shape({
		field: PropTypes.string,
		order: PropTypes.oneOf(["asc", "desc"]),
	}),
	setSort: PropTypes.func,
	debouncedSearch: PropTypes.string,
	setSearch: PropTypes.func,
	isSearching: PropTypes.bool,
	setIsSearching: PropTypes.func,
	setIsLoading: PropTypes.func,
	triggerUpdate: PropTypes.func,
};
