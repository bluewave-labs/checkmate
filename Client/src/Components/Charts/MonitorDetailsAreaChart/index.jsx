import PropTypes from "prop-types";
import {
	AreaChart,
	Area,
	XAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	Text,
} from "recharts";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { formatDateWithTz } from "../../../Utils/timeUtils";
import "./index.css";

const CustomToolTip = ({ active, payload, label }) => {
	const uiTimezone = useSelector((state) => state.ui.timezone);
	const theme = useTheme();
	if (active && payload && payload.length) {
		const responseTime = payload[0]?.payload?.originalAvgResponseTime
			? payload[0]?.payload?.originalAvgResponseTime
			: (payload[0]?.payload?.avgResponseTime ?? 0);
		return (
			<Box
				className="area-tooltip"
				sx={{
					backgroundColor: theme.palette.background.main,
					border: 1,
					borderColor: theme.palette.border.dark,
					borderRadius: theme.shape.borderRadius,
					py: theme.spacing(2),
					px: theme.spacing(4),
				}}
			>
				<Typography
					sx={{
						color: theme.palette.text.tertiary,
						fontSize: 12,
						fontWeight: 500,
					}}
				>
					{formatDateWithTz(label, "ddd, MMMM D, YYYY, h:mm A", uiTimezone)}
				</Typography>
				<Box mt={theme.spacing(1)}>
					<Box
						display="inline-block"
						width={theme.spacing(4)}
						height={theme.spacing(4)}
						backgroundColor={theme.palette.primary.main}
						sx={{ borderRadius: "50%" }}
					/>
					<Stack
						display="inline-flex"
						direction="row"
						justifyContent="space-between"
						ml={theme.spacing(3)}
						sx={{
							"& span": {
								color: theme.palette.text.tertiary,
								fontSize: 11,
								fontWeight: 500,
							},
						}}
					>
						<Typography
							component="span"
							sx={{ opacity: 0.8 }}
						>
							Response Time
						</Typography>{" "}
						<Typography component="span">
							{Math.floor(responseTime)}
							<Typography
								component="span"
								sx={{ opacity: 0.8 }}
							>
								{" "}
								ms
							</Typography>
						</Typography>
					</Stack>
				</Box>
				{/* Display original value */}
			</Box>
		);
	}
	return null;
};

CustomToolTip.propTypes = {
	active: PropTypes.bool,
	payload: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.number,
			payload: PropTypes.shape({
				_id: PropTypes.string,
				avgResponseTime: PropTypes.number,
				originalAvgResponseTime: PropTypes.number,
			}),
		})
	),
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
const CustomTick = ({ x, y, payload, index }) => {
	const theme = useTheme();

	const uiTimezone = useSelector((state) => state.ui.timezone);
	// Render nothing for the first tick
	if (index === 0) return null;
	return (
		<Text
			x={x}
			y={y + 10}
			textAnchor="middle"
			fill={theme.palette.text.tertiary}
			fontSize={11}
			fontWeight={400}
		>
			{formatDateWithTz(payload?.value, "h:mm a", uiTimezone)}
		</Text>
	);
};

CustomTick.propTypes = {
	x: PropTypes.number,
	y: PropTypes.number,
	payload: PropTypes.object,
	index: PropTypes.number,
};

const MonitorDetailsAreaChart = ({ checks }) => {
	const theme = useTheme();
	const memoizedChecks = useMemo(() => checks, [checks[0]]);
	const [isHovered, setIsHovered] = useState(false);

	return (
		<ResponsiveContainer
			width="100%"
			minWidth={25}
			height={220}
		>
			<AreaChart
				width="100%"
				height="100%"
				data={memoizedChecks}
				margin={{
					top: 10,
					right: 0,
					left: 0,
					bottom: 0,
				}}
				onMouseMove={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<CartesianGrid
					stroke={theme.palette.border.light}
					strokeWidth={1}
					strokeOpacity={1}
					fill="transparent"
					vertical={false}
				/>
				<defs>
					<linearGradient
						id="colorUv"
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop
							offset="0%"
							stopColor={theme.palette.primary.main}
							stopOpacity={0.8}
						/>
						<stop
							offset="100%"
							stopColor={theme.palette.primary.light}
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
				<XAxis
					stroke={theme.palette.border.dark}
					dataKey="_id"
					tick={<CustomTick />}
					minTickGap={0}
					axisLine={false}
					tickLine={false}
					height={20}
					interval="equidistantPreserveStart"
				/>
				<Tooltip
					cursor={{ stroke: theme.palette.border.light }}
					content={<CustomToolTip />}
					wrapperStyle={{ pointerEvents: "none" }}
				/>
				<Area
					type="monotone"
					dataKey="avgResponseTime"
					stroke={theme.palette.primary.main}
					fill="url(#colorUv)"
					strokeWidth={isHovered ? 2.5 : 1.5}
					activeDot={{ stroke: theme.palette.background.main, r: 5 }}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

MonitorDetailsAreaChart.propTypes = {
	checks: PropTypes.array,
};

export default MonitorDetailsAreaChart;
