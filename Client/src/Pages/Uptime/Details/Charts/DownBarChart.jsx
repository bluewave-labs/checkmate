import { memo, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveContainer, BarChart, XAxis, Bar, Cell } from "recharts";
import PropTypes from "prop-types";
import CustomLabels from "./CustomLabels";

const DownBarChart = memo(({ stats, type, onBarHover }) => {
	const theme = useTheme();

	const [chartHovered, setChartHovered] = useState(false);
	const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={250}
			height={155}
		>
			<BarChart
				width="100%"
				height="100%"
				data={stats.downChecks}
				onMouseEnter={() => {
					setChartHovered(true);
					onBarHover({ time: null, totalChecks: 0 });
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
							firstDataPoint={stats.downChecks?.[0] ?? {}}
							lastDataPoint={stats.downChecks?.[stats.downChecks.length - 1] ?? {}}
							type={type}
						/>
					}
				/>
				<Bar
					dataKey="avgResponseTime"
					maxBarSize={7}
					background={{ fill: "transparent" }}
				>
					{stats.downChecks.map((entry, index) => (
						<Cell
							key={`cell-${entry.time}`}
							fill={
								hoveredBarIndex === index
									? theme.palette.error.main
									: chartHovered
										? theme.palette.error.light
										: theme.palette.error.main
							}
							onMouseEnter={() => {
								setHoveredBarIndex(index);
								onBarHover(entry);
							}}
							onMouseLeave={() => {
								setHoveredBarIndex(null);
								onBarHover({ time: null, totalChecks: 0 });
							}}
						/>
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
});

DownBarChart.displayName = "DownBarChart";
DownBarChart.propTypes = {
	stats: PropTypes.shape({
		downChecks: PropTypes.arrayOf(PropTypes.object),
		downChecksAggregate: PropTypes.object,
	}),
	type: PropTypes.string,
	onBarHover: PropTypes.func,
};
export default DownBarChart;
