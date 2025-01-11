import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";

/* TODO delete component */

const MINIMUM_VALUE = 0;
const MAXIMUM_VALUE = 100;
const CHART_MAXIMUM_DATA = {
	value: MAXIMUM_VALUE,
	fill: "transparent",
};
const PROGRESS_THRESHOLD = 50;
const DEFAULT_WIDTH = 60;

const RADIUS_SIZE = "90%";
const START_ANGLE = 90;
const CHART_RANGE = 360;
const RADIAL_BAR_CHART_PROPS = {
	innerRadius: RADIUS_SIZE,
	outerRadius: RADIUS_SIZE,
	barSize: 6,
	startAngle: START_ANGLE,
	endAngle: START_ANGLE - CHART_RANGE,
	margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

const RADIAL_BAR_PROPS = {
	dataKey: "value",
	cornerRadius: 8,
};

Gauge.propTypes = {
	progressValue: PropTypes.number.isRequired,
	width: PropTypes.number,
};

/**
 * A circular gauge component that displays a progress value and text.
 * The gauge fills based on the progress value and changes color at a 50% threshold.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.progressValue - The value to display in the gauge (0-100)
 * @param {number} props.width - Width of the gauge container in pixels
 * @returns {JSX.Element} A circular gauge chart with progress value and text
 *
 * @example
 * <Gauge
 *   progressValue={75}
 *   width={200}
 * />
 */

function Gauge({ progressValue, width = DEFAULT_WIDTH }) {
	const theme = useTheme();
	const myProgressValue = Math.max(MINIMUM_VALUE, Math.min(progressValue, MAXIMUM_VALUE));
	const chartColor =
		progressValue > PROGRESS_THRESHOLD
			? theme.palette.primary.main
			: theme.palette.error.main;
	const chartData = [
		CHART_MAXIMUM_DATA,
		{
			value: myProgressValue,
			fill: chartColor,
		},
	];

	return (
		<ResponsiveContainer
			aspect={1}
			width={width}
			style={{ marginInline: "auto" }}
		>
			<RadialBarChart
				{...RADIAL_BAR_CHART_PROPS}
				data={chartData}
			>
				<RadialBar
					{...RADIAL_BAR_PROPS}
					fill={
						progressValue > PROGRESS_THRESHOLD
							? theme.palette.primary.main
							: theme.palette.error.main
					}
					background={{ fill: theme.palette.primary.lowContrast }}
					label={{
						position: "center",
						content: () => (
							<text
								x="50%"
								y="50%"
								textAnchor="middle"
								dominantBaseline="middle"
								style={{
									...theme.typography.body2,
									fill: theme.typography.body2.color,
								}}
							>
								{`${myProgressValue}%`}
							</text>
						),
					}}
				/>
			</RadialBarChart>
		</ResponsiveContainer>
	);
}

export { Gauge };
