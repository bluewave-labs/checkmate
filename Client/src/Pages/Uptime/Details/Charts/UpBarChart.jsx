import { memo, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveContainer, BarChart, XAxis, Bar, Cell } from "recharts";
import PropTypes from "prop-types";
import CustomLabels from "./CustomLabels";

const UpBarChart = memo(({ monitor, type, onBarHover }) => {
	const theme = useTheme();
	const [chartHovered, setChartHovered] = useState(false);
	const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

	const getColorRange = (responseTime) => {
		return responseTime < 200
			? { main: theme.palette.success.main, light: theme.palette.success.light }
			: responseTime < 300
				? { main: theme.palette.warning.main, light: theme.palette.warning.light }
				: { main: theme.palette.error.main, light: theme.palette.error.light };
	};

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={210}
			height={155}
		>
			<BarChart
				width="100%"
				height="100%"
				data={monitor.groupedUpChecks}
				onMouseEnter={() => {
					setChartHovered(true);
					onBarHover({ time: null, totalChecks: 0, avgResponseTime: 0 });
				}}
				onMouseLeave={() => {
					setChartHovered(false);
					setHoveredBarIndex(null);
					onBarHover(null);
				}}
			>
				<XAxis
					stroke={theme.palette.border.dark}
					height={15}
					tick={false}
					label={
						<CustomLabels
							x={0}
							y={0}
							width="100%"
							height="100%"
							firstDataPoint={monitor.groupedUpChecks[0]}
							lastDataPoint={monitor.groupedUpChecks[monitor.groupedUpChecks.length - 1]}
							type={type}
						/>
					}
				/>
				<Bar
					dataKey="avgResponseTime"
					maxBarSize={7}
					background={{ fill: "transparent" }}
				>
					{monitor.groupedUpChecks.map((entry, index) => {
						let { main, light } = getColorRange(entry.avgResponseTime);
						return (
							<Cell
								key={`cell-${entry.time}`}
								fill={hoveredBarIndex === index ? main : chartHovered ? light : main}
								onMouseEnter={() => {
									setHoveredBarIndex(index);
									onBarHover(entry);
								}}
								onMouseLeave={() => {
									setHoveredBarIndex(null);
									onBarHover({
										time: null,
										totalChecks: 0,
										groupUptimePercentage: 0,
									});
								}}
							/>
						);
					})}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
});

// Add display name for the component
UpBarChart.displayName = "UpBarChart";

// Validate props using PropTypes
UpBarChart.propTypes = {
	monitor: PropTypes.shape({
		groupedUpChecks: PropTypes.array,
	}),
	type: PropTypes.string,
	onBarHover: PropTypes.func,
};
export default UpBarChart;
