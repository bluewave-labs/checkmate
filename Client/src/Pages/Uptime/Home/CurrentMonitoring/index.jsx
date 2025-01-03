import { useTheme } from "@emotion/react";
import { Box, Stack } from "@mui/material";
import Search from "../../../../Components/Inputs/Search";
import MemoizedMonitorTable from "../UptimeTable";
import { useState } from "react";
import useDebounce from "../../../../Utils/debounce";
import PropTypes from "prop-types";
import { Heading } from "../../../../Components/Heading";

const CurrentMonitoring = ({ totalMonitors, monitors, isAdmin, handlePause }) => {
	const theme = useTheme();
	const [search, setSearch] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const debouncedFilter = useDebounce(search, 500);
	const handleSearch = (value) => {
		setIsSearching(true);
		setSearch(value);
	};
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
					{totalMonitors}
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
			<MemoizedMonitorTable
				isAdmin={isAdmin}
				filter={debouncedFilter}
				setIsSearching={setIsSearching}
				isSearching={isSearching}
				handlePause={handlePause}
			/>
		</Box>
	);
};

CurrentMonitoring.propTypes = {
	handlePause: PropTypes.func,
	totalMonitors: PropTypes.number,
	monitors: PropTypes.array,
	isAdmin: PropTypes.bool,
};

export { CurrentMonitoring };
