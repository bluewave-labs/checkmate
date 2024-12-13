import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import {
	BarChart,
	Bar,
	XAxis,
	ResponsiveContainer,
	Cell,
	RadialBarChart,
	RadialBar,
} from "recharts";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { formatDateWithTz } from "../../../../Utils/timeUtils";

const CustomLabels = ({ x, width, height, firstDataPoint, lastDataPoint, type }) => {
	const uiTimezone = useSelector((state) => state.ui.timezone);
	const dateFormat = type === "day" ? "MMM D, h:mm A" : "MMM D";

	return (
		<>
			<text
				x={x}
				y={height}
				dy={-3}
				textAnchor="start"
				fontSize={11}
			>
				{formatDateWithTz(new Date(firstDataPoint.time), dateFormat, uiTimezone)}
			</text>
			<text
				x={width}
				y={height}
				dy={-3}
				textAnchor="end"
				fontSize={11}
			>
				{formatDateWithTz(new Date(lastDataPoint.time), dateFormat, uiTimezone)}
			</text>
		</>
	);
};

CustomLabels.propTypes = {
	x: PropTypes.number.isRequired,
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	firstDataPoint: PropTypes.object.isRequired,
	lastDataPoint: PropTypes.object.isRequired,
	type: PropTypes.string.isRequired,
};

const UpBarChart = memo(({ data, type, onBarHover }) => {
	const theme = useTheme();

	const [chartHovered, setChartHovered] = useState(false);
	const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

	const getColorRange = (uptime) => {
		return uptime > 80
			? { main: theme.palette.success.main, light: theme.palette.success.light }
			: uptime > 50
				? { main: theme.palette.warning.main, light: theme.palette.warning.light }
				: { main: theme.palette.error.contrastText, light: theme.palette.error.light };
	};

	// TODO - REMOVE THIS LATER
	const reversedData = useMemo(() => [...data].reverse(), [data]);

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={210}
			height={155}
		>
			<BarChart
				width="100%"
				height="100%"
				data={reversedData}
				onMouseEnter={() => {
					setChartHovered(true);
					onBarHover({ time: null, totalChecks: 0, uptimePercentage: 0 });
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
							firstDataPoint={reversedData[0]}
							lastDataPoint={reversedData[reversedData.length - 1]}
							type={type}
						/>
					}
				/>
				<Bar
					dataKey="totalChecks"
					maxBarSize={7}
					background={{ fill: "transparent" }}
				>
					{reversedData.map((entry, index) => {
						let { main, light } = getColorRange(entry.uptimePercentage);
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
										uptimePercentage: 0,
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
	data: PropTypes.arrayOf(PropTypes.object),
	type: PropTypes.string,
	onBarHover: PropTypes.func,
};
export { UpBarChart };

const DownBarChart = memo(({ data, type, onBarHover }) => {
	const theme = useTheme();

	const [chartHovered, setChartHovered] = useState(false);
	const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

	// TODO - REMOVE THIS LATER
	const reversedData = useMemo(() => [...data].reverse(), [data]);

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={250}
			height={155}
		>
			<BarChart
				width="100%"
				height="100%"
				data={reversedData}
				onMouseEnter={() => {
					setChartHovered(true);
					onBarHover({ time: null, totalIncidents: 0 });
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
							firstDataPoint={reversedData[0]}
							lastDataPoint={reversedData[reversedData.length - 1]}
							type={type}
						/>
					}
				/>
				<Bar
					dataKey="totalIncidents"
					maxBarSize={7}
					background={{ fill: "transparent" }}
				>
					{reversedData.map((entry, index) => (
						<Cell
							key={`cell-${entry.time}`}
							fill={
								hoveredBarIndex === index
									? theme.palette.error.contrastText
									: chartHovered
										? theme.palette.error.light
										: theme.palette.error.contrastText
							}
							onMouseEnter={() => {
								setHoveredBarIndex(index);
								onBarHover(entry);
							}}
							onMouseLeave={() => {
								setHoveredBarIndex(null);
								onBarHover({ time: null, totalIncidents: 0 });
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
	data: PropTypes.arrayOf(PropTypes.object),
	type: PropTypes.string,
	onBarHover: PropTypes.func,
};
export { DownBarChart };

const ResponseGaugeChart = ({ data }) => {
	const theme = useTheme();

	let max = 1000; // max ms

	const memoizedData = useMemo(
		() => [{ response: max, fill: "transparent", background: false }, ...data],
		[data[0].response]
	);

	let responseTime = Math.floor(memoizedData[1].response);
	let responseProps =
		responseTime <= 200
			? {
					category: "Excellent",
					main: theme.palette.success.main,
					bg: theme.palette.success.contrastText,
				}
			: responseTime <= 500
				? {
						category: "Fair",
						main: theme.palette.success.main,
						bg: theme.palette.success.contrastText,
					}
				: responseTime <= 600
					? {
							category: "Acceptable",
							main: theme.palette.warning.main,
							bg: theme.palette.warning.dark,
						}
					: {
							category: "Poor",
							main: theme.palette.error.light,
							bg: theme.palette.error.dark,
						};

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={210}
			height={155}
		>
			<RadialBarChart
				width="100%"
				height="100%"
				cy="89%"
				data={memoizedData}
				startAngle={180}
				endAngle={0}
				innerRadius={100}
				outerRadius={150}
			>
				<text
					x={0}
					y="100%"
					dx="5%"
					dy={-2}
					textAnchor="start"
					fontSize={11}
				>
					low
				</text>
				<text
					x="100%"
					y="100%"
					dx="-3%"
					dy={-2}
					textAnchor="end"
					fontSize={11}
				>
					high
				</text>
				<text
					x="50%"
					y="45%"
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={18}
					fontWeight={400}
				>
					{responseProps.category}
				</text>
				<text
					x="50%"
					y="55%"
					textAnchor="middle"
					dominantBaseline="hanging"
					fontSize={25}
				>
					<tspan fontWeight={600}>{responseTime}</tspan> <tspan opacity={0.8}>ms</tspan>
				</text>
				<RadialBar
					background={{ fill: responseProps.bg }}
					clockWise
					dataKey="response"
					stroke="none"
				>
					<Cell
						fill="transparent"
						background={false}
						barSize={0}
					/>
					<Cell fill={responseProps.main} />
				</RadialBar>
			</RadialBarChart>
		</ResponsiveContainer>
	);
};

ResponseGaugeChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export { ResponseGaugeChart };
