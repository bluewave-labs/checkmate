import { useEffect, useState } from "react";
import { networkService } from "../../../../main";
import { createToast } from "../../../../Utils/toastUtils";
import { useTheme } from "@emotion/react";
const getMonitorWithPercentage = (monitor, theme) => {
	let uptimePercentage = "";
	let percentageColor = "";

	if (monitor.uptimePercentage !== undefined) {
		uptimePercentage =
			monitor.uptimePercentage === 0 ? "0" : (monitor.uptimePercentage * 100).toFixed(2);

		percentageColor =
			monitor.uptimePercentage < 0.25
				? theme.palette.error.main
				: monitor.uptimePercentage < 0.5
					? theme.palette.warning.main
					: monitor.uptimePercentage < 0.75
						? theme.palette.success.main
						: theme.palette.success.main;
	}

	return {
		id: monitor._id,
		name: monitor.name,
		url: monitor.url,
		title: monitor.name,
		percentage: uptimePercentage,
		percentageColor,
		monitor: monitor,
	};
};

export const useMonitorFetch = ({
	authToken,
	teamId,
	limit,
	page,
	rowsPerPage,
	filter,
	field,
	order,
	triggerUpdate,
}) => {
	const [monitorsAreLoading, setMonitorsAreLoading] = useState(false);
	const [monitors, setMonitors] = useState(undefined);
	const [filteredMonitors, setFilteredMonitors] = useState(undefined);
	const [monitorsSummary, setMonitorsSummary] = useState(undefined);
	const [networkError, setNetworkError] = useState(false);

	const theme = useTheme();

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				setMonitorsAreLoading(true);
				const res = await networkService.getMonitorsByTeamId({
					authToken,
					teamId,
					limit,
					types: ["http", "ping", "docker", "port"],
					page,
					rowsPerPage,
					filter,
					field,
					order,
				});
				const { monitors, filteredMonitors, summary } = res.data.data;
				const mappedMonitors = filteredMonitors.map((monitor) =>
					getMonitorWithPercentage(monitor, theme)
				);
				setMonitors(monitors);
				setFilteredMonitors(mappedMonitors);
				setMonitorsSummary(summary);
			} catch (error) {
				setNetworkError(true);
				createToast({
					body: error.message,
				});
			} finally {
				setMonitorsAreLoading(false);
			}
		};
		fetchMonitors();
	}, [
		authToken,
		teamId,
		limit,
		field,
		filter,
		order,
		page,
		rowsPerPage,
		theme,
		triggerUpdate,
	]);
	return {
		monitors,
		filteredMonitors,
		monitorsSummary,
		monitorsAreLoading,
		networkError,
	};
};

export default useMonitorFetch;
