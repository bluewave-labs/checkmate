import ChartBox from "./ChartBox";
import MonitorDetailsAreaChart from "../../../../../Components/Charts/MonitorDetailsAreaChart";
import ResponseTimeIcon from "../../../../../assets/icons/response-time-icon.svg?react";
const ResponseTImeChart = ({ monitor, dateRange }) => {
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
