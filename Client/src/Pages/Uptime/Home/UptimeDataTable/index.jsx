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
import useDebounce from "../../../../Utils/debounce";
import { useState } from "react";
import useUtils from "../../utils";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const UptimeDataTable = ({
	isAdmin,
	isLoading,
	monitors,
	monitorCount,
	sort,
	setSort,
	search,
	setSearch,
	isSearching,
	setIsSearching,
	triggerUpdate,
}) => {
	const { determineState } = useUtils();

	const theme = useTheme();
	const navigate = useNavigate();

	//Utils
	const debouncedFilter = useDebounce(search, 500);
	const handleSearch = (value) => {
		setIsSearching(true);
		setSearch(value);
	};

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
					width="max-content"
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
							<ArrowUpwardRoundedIcon />
						) : (
							<ArrowDownwardRoundedIcon />
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
			>
				<Heading component="h2">Uptime monitors</Heading>

				<Box
					className="current-monitors-counter"
					color={theme.palette.text.primary}
					border={1}
					borderColor={theme.palette.border.light}
					backgroundColor={theme.palette.background.accent}
				>
					{monitorCount}
				</Box>
				<Box
					width="25%"
					minWidth={150}
					ml="auto"
				>
					<Search
						options={monitors}
						filteredBy="name"
						inputValue={search}
						handleInputChange={handleSearch}
					/>
				</Box>
			</Stack>
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
							top="50%"
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
				<DataTable
					headers={headers}
					data={monitors}
					config={{
						rowSX: {
							cursor: "pointer",
							"&:hover": {
								backgroundColor: theme.palette.background.accent,
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
