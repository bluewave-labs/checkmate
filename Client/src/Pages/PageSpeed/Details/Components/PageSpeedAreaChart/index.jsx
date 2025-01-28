import ChartBox from "../../../../../Components/Charts/ChartBox";
import AreaChart from "../Charts/AreaChart";
import AreaChartLegend from "../Charts/AreaChartLegend";
import ScoreIcon from "../../../../../assets/icons/monitor-graph-line.svg?react";
import { Stack } from "@mui/material";

import { useTheme } from "@emotion/react";

const PageSpeedAreaChart = ({ shouldRender, monitor, metrics, handleMetrics }) => {
	const theme = useTheme();
	if (typeof monitor === "undefined") {
		return null;
	}

	const data = monitor?.checks ? [...monitor.checks].reverse() : [];

	return (
		<Stack
			direction="row"
			gap={theme.spacing(10)}
		>
			<ChartBox
				justifyContent="flex-start"
				icon={<ScoreIcon />}
				header="Score history"
				height="100%"
				borderRadiusRight={16}
				Legend={
					<AreaChartLegend
						metrics={metrics}
						handleMetrics={handleMetrics}
					/>
				}
			>
				<AreaChart
					data={data}
					monitor={monitor}
					metrics={metrics}
				/>
			</ChartBox>
		</Stack>
	);
};

export default PageSpeedAreaChart;
