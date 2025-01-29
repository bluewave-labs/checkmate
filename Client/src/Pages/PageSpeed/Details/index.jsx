// Components
import { Stack, Typography } from "@mui/material";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import MonitorStatusHeader from "../../../Components/MonitorStatusHeader";
import PageSpeedStatusBoxes from "./Components/PageSpeedStatusBoxes";
import PageSpeedAreaChart from "./Components/PageSpeedAreaChart";
import PerformanceReport from "./Components/PerformanceReport";
import Fallback from "../../../Components/Fallback";
// Utils
import { useTheme } from "@emotion/react";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMonitorFetch } from "./Hooks/useMonitorFetch";
import { useState } from "react";
// Constants
const BREADCRUMBS = [
	{ name: "pagespeed", path: "/pagespeed" },
	{ name: "details", path: `` },
	// { name: "details", path: `/pagespeed/${monitorId}` }, // Not needed?
];

const PageSpeedDetails = () => {
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const { monitorId } = useParams();
	const { authToken } = useSelector((state) => state.auth);

	const { monitor, audits, isLoading } = useMonitorFetch({
		authToken,
		monitorId,
	});

	console.log(monitor, audits, isLoading);

	const [metrics, setMetrics] = useState({
		accessibility: true,
		bestPractices: true,
		performance: true,
		seo: true,
	});

	const handleMetrics = (id) => {
		setMetrics((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<Stack gap={theme.spacing(10)}>
			<Breadcrumbs list={BREADCRUMBS} />
			<MonitorStatusHeader
				isAdmin={isAdmin}
				shouldRender={!isLoading}
				monitor={monitor}
			/>
			<PageSpeedStatusBoxes
				shouldRender={!isLoading}
				monitor={monitor}
			/>
			<Typography
				variant="body2"
				my={theme.spacing(8)}
			>
				Showing statistics for past 24 hours.
			</Typography>
			<PageSpeedAreaChart
				shouldRender={!isLoading}
				monitor={monitor}
				metrics={metrics}
				handleMetrics={handleMetrics}
			/>
			<PerformanceReport
				shouldRender={!isLoading}
				audits={audits}
			/>
		</Stack>
	);
};

export default PageSpeedDetails;
