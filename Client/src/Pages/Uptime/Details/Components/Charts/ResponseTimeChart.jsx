import ChartBox from "./ChartBox";
import MonitorDetailsAreaChart from "../../../../../Components/Charts/MonitorDetailsAreaChart";
import ResponseTimeIcon from "../../../../../assets/icons/response-time-icon.svg?react";
import SkeletonLayout from "./ResponseTimeChartSkeleton";
const ResponseTImeChart = ({ shouldRender = true, monitor, dateRange }) => {
	if (!shouldRender) {
		return <SkeletonLayout />;
	}

	return (
		<ChartBox
			icon={<ResponseTimeIcon />}
			header="Response Times"
		>
			<MonitorDetailsAreaChart
				checks={monitor.groupedChecks ?? []}
				dateRange={dateRange}
			/>
		</ChartBox>
	);
};

export default ResponseTImeChart;
