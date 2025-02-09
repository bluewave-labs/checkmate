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
import ChartBox from "../../../../../Components/Charts/ChartBox";
import ResponseTimeIcon from "../../../../../assets/icons/response-time-icon.svg?react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { formatDateWithTz } from "../../../../../Utils/timeUtils";

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
					backgroundColor: theme.palette.primary.main,
					border: 1,
					borderColor: theme.palette.primary.lowContrast,
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
							Response time
						</Typography>
						<Typography
							ml={theme.spacing(4)}
							component="span"
						>
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

const DistributedUptimeResponseChart = ({ checks }) => {
	const theme = useTheme();
	const [isHovered, setIsHovered] = useState(false);

	if (checks.length === 0) return null;
	return (
		<ChartBox
			icon={<ResponseTimeIcon />}
			header="Response Times"
			sx={{ padding: 0 }}
		>
			<ResponsiveContainer
				width="100%"
				minWidth={25}
				height={220}
			>
				<AreaChart
					width="100%"
					height="100%"
					data={checks}
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
						stroke={theme.palette.primary.lowContrast}
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
								stopColor={theme.palette.accent.darker}
								stopOpacity={0.8}
							/>
							<stop
								offset="100%"
								stopColor={theme.palette.accent.main}
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<XAxis
						stroke={theme.palette.primary.lowContrast}
						dataKey="_id"
						tick={<CustomTick />}
						minTickGap={0}
						axisLine={false}
						tickLine={false}
						height={20}
					/>
					<Tooltip
						cursor={{ stroke: theme.palette.primary.lowContrast }}
						content={<CustomToolTip />}
						wrapperStyle={{ pointerEvents: "none" }}
					/>
					<Area
						type="monotone"
						dataKey="avgResponseTime"
						stroke={theme.palette.primary.accent}
						fill="url(#colorUv)"
						strokeWidth={isHovered ? 2.5 : 1.5}
						activeDot={{ stroke: theme.palette.background.main, r: 5 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</ChartBox>
	);
};

DistributedUptimeResponseChart.propTypes = {
	checks: PropTypes.array,
};

export default DistributedUptimeResponseChart;
