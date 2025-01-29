// Components
import Breadcrumbs from "../../../Components/Breadcrumbs";
import Greeting from "../../../Utils/greeting";
import StatusBoxes from "./Components/StatusBoxes";
import UptimeDataTable from "./Components/UptimeDataTable";
import Pagination from "../../../Components/Table/TablePagination";
import CreateMonitorHeader from "../../../Components/CreateMonitorHeader";
import Fallback from "../../../Components/Fallback";
import SearchComponent from "./Components/SearchComponent";

import MonitorCountHeader from "../../../Components/MonitorCountHeader";

// MUI Components
import { Stack, Box, Button } from "@mui/material";

// Utils
import { useState, useCallback } from "react";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import useMonitorsFetch from "./Hooks/useMonitorsFetch";
import { useSelector, useDispatch } from "react-redux";
import { setRowsPerPage } from "../../../Features/UI/uiSlice";
import PropTypes from "prop-types";

const BREADCRUMBS = [{ name: `Uptime`, path: "/uptime" }];

const CreateMonitorButton = ({ shouldRender }) => {
	// Utils
	const navigate = useNavigate();
	if (shouldRender === false) {
		return;
	}

	return (
		<Box alignSelf="flex-end">
			<Button
				variant="contained"
				color="accent"
				onClick={() => {
					navigate("/uptime/create");
				}}
			>
				Create new
			</Button>
		</Box>
	);
};

CreateMonitorButton.propTypes = {
	shouldRender: PropTypes.bool,
};

const UptimeMonitors = () => {
	// Redux state
	const { authToken, user } = useSelector((state) => state.auth);
	const rowsPerPage = useSelector((state) => state.ui.monitors.rowsPerPage);

	// Local state
	const [search, setSearch] = useState(undefined);
	const [page, setPage] = useState(undefined);
	const [sort, setSort] = useState(undefined);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [monitorUpdateTrigger, setMonitorUpdateTrigger] = useState(false);

	// Utils
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const dispatch = useDispatch();

	// Handlers
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

	const triggerUpdate = useCallback(() => {
		setMonitorUpdateTrigger((prev) => !prev);
	}, []);

	const teamId = user.teamId;
	const { monitorsAreLoading, monitors, filteredMonitors, monitorsSummary } =
		useMonitorsFetch({
			authToken,
			teamId,
			limit: 25,
			page: page,
			rowsPerPage: rowsPerPage,
			filter: search,
			field: sort?.field,
			order: sort?.order,
			triggerUpdate: monitorUpdateTrigger,
		});
	const totalMonitors = monitorsSummary?.totalMonitors ?? 0;
	if (!isLoading && !monitorsAreLoading && monitors?.length === 0) {
		return (
			<Fallback
				vowelStart={true}
				title="uptime monitor"
				checks={["Check if a website or service is up and running"]}
				link="/uptime/create"
				isAdmin={isAdmin}
			/>
		);
	}

	return (
		<Stack
			className="monitors"
			gap={theme.spacing(10)}
		>
			<Breadcrumbs list={BREADCRUMBS} />
			<CreateMonitorHeader
				isAdmin={isAdmin}
				shouldRender={!isLoading}
				path="/uptime/create"
			/>
			<Greeting type="uptime" />
			<StatusBoxes
				monitorsSummary={monitorsSummary}
				shouldRender={!monitorsAreLoading}
			/>

			<Stack direction={"row"}>
				<MonitorCountHeader
					shouldRender={monitors?.length > 0 && !monitorsAreLoading}
					monitorCount={totalMonitors}
					heading={"Uptime monitors"}
				></MonitorCountHeader>
				<SearchComponent
					monitors={monitors}
					onSearchChange={setSearch}
					setIsSearching={setIsSearching}
				/>
			</Stack>
			<UptimeDataTable
				isAdmin={isAdmin}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
				filteredMonitors={filteredMonitors}
				monitors={monitors}
				monitorCount={totalMonitors}
				sort={sort}
				setSort={setSort}
				setSearch={setSearch}
				isSearching={isSearching}
				monitorsAreLoading={monitorsAreLoading}
				triggerUpdate={triggerUpdate}
			/>
			<Pagination
				itemCount={totalMonitors}
				paginationLabel="monitors"
				page={page}
				rowsPerPage={rowsPerPage}
				handleChangePage={handleChangePage}
				handleChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</Stack>
	);
};

export default UptimeMonitors;
