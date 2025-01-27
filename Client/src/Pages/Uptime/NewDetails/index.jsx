// Components
import Breadcrumbs from "../../../Components/Breadcrumbs";
import MonitorHeader from "./Components/MonitorHeader";
import StatusBoxes from "./Components/StatusBoxes";
import TimeFramePicker from "./Components/TimeFramePicker";
import ChartBoxes from "./Components/ChartBoxes";
import ResponseTimeChart from "./Components/Charts/ResponseTimeChart";
// MUI Components
import { Stack } from "@mui/material";

// Utils
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import useMonitorFetch from "./Hooks/useMonitorFetch";
import useCertificateFetch from "./Hooks/useCertificateFetch";
// Constants
const BREADCRUMBS = [
	{ name: "uptime", path: "/uptime" },
	{ name: "details", path: "" },
	// { name: "details", path: `/uptime/${monitorId}` }, Is this needed?  We can't click on this anywy
];

const certificateDateFormat = "MMM D, YYYY h A";

const UptimeDetails = () => {
	// Redux state
	const { authToken } = useSelector((state) => state.auth);
	const uiTimezone = useSelector((state) => state.ui.timezone);

	// Local state
	const [dateRange, setDateRange] = useState("day");
	const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
	const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);

	// Utils
	const dateFormat = dateRange === "day" ? "MMM D, h A" : "MMM D";
	const { monitorId } = useParams();
	const theme = useTheme();

	const { monitor, monitorIsLoading } = useMonitorFetch({
		authToken,
		monitorId,
		dateRange,
	});

	const { certificateExpiry, certificateIsLoading } = useCertificateFetch({
		monitor,
		authToken,
		monitorId,
		certificateDateFormat,
		uiTimezone,
	});

	return (
		<Stack gap={theme.spacing(10)}>
			<Breadcrumbs list={BREADCRUMBS} />
			<MonitorHeader monitor={monitor} />
			<StatusBoxes
				monitor={monitor}
				certificateExpiry={certificateExpiry}
			/>
			<TimeFramePicker
				dateRange={dateRange}
				setDateRange={setDateRange}
			/>
			<ChartBoxes
				monitor={monitor}
				uiTimezone={uiTimezone}
				dateRange={dateRange}
				dateFormat={dateFormat}
				hoveredUptimeData={hoveredUptimeData}
				setHoveredUptimeData={setHoveredUptimeData}
				hoveredIncidentsData={hoveredIncidentsData}
				setHoveredIncidentsData={setHoveredIncidentsData}
			/>
			<ResponseTimeChart
				monitor={monitor}
				dateRange={dateRange}
			/>
		</Stack>
	);
};

export default UptimeDetails;
