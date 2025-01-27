// Components
import Breadcrumbs from "../../../Components/Breadcrumbs";

// MUI Components
import { Stack } from "@mui/material";

// Utils
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMonitorFetch } from "./Hooks/useMonitorFetch";
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

	// Utils
	const dateFormat = dateRange === "day" ? "MMM D, h A" : "MMM D";
	const { monitorId } = useParams();

	const { monitor, monitorIsLoading } = useMonitorFetch({
		authToken,
		monitorId,
		dateRange,
	});

	console.log(monitor);

	return (
		<Stack>
			<Breadcrumbs list={BREADCRUMBS} />
		</Stack>
	);
};

export default UptimeDetails;
