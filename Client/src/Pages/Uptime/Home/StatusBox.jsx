import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Box, Stack, Typography } from "@mui/material";
import Arrow from "../../../assets/icons/top-right-arrow.svg?react";
import Background from "../../../assets/Images/background-grid.svg?react";
import ClockSnooze from "../../../assets/icons/clock-snooze.svg?react";

const StatusBox = ({ title, value }) => {
	const theme = useTheme();

	let sharedStyles = {
		position: "absolute",
		right: 8,
		opacity: 0.5,
		"& svg path": { stroke: theme.palette.other.icon },
	};

	let color;
	let icon;
	if (title === "up") {
		color = theme.palette.success.main;
		icon = (
			<Box sx={{ ...sharedStyles, top: 8 }}>
				<Arrow />
			</Box>
		);
	} else if (title === "down") {
		color = theme.palette.error.main;
		icon = (
			<Box sx={{ ...sharedStyles, transform: "rotate(180deg)", top: 5 }}>
				<Arrow />
			</Box>
		);
	} else if (title === "paused") {
		color = theme.palette.warning.main;
		icon = (
			<Box sx={{ ...sharedStyles, top: 12, right: 12 }}>
				<ClockSnooze />
			</Box>
		);
	}

	return (
		<Box
			position="relative"
			flex={1}
			border={1}
			borderColor={theme.palette.border.light}
			borderRadius={theme.shape.borderRadius}
			backgroundColor={theme.palette.background.main}
			p={theme.spacing(8)}
			overflow="hidden"
			sx={{
				"&:hover": {
					backgroundColor: theme.palette.background.accent,
				},
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: "-10%",
					left: "5%",
					pointerEvents: "none",
					"& svg g g:last-of-type path": {
						stroke: theme.palette.other.grid,
					},
				}}
			>
				<Background />
			</Box>
			<Box
				textTransform="uppercase"
				fontSize={15}
				letterSpacing={0.5}
				color={theme.palette.text.secondary}
				mb={theme.spacing(8)}
				sx={{ opacity: 0.6 }}
			>
				{title}
			</Box>
			{icon}
			<Stack
				direction="row"
				alignItems="flex-start"
				fontSize={36}
				fontWeight={600}
				color={color}
				gap="2px"
			>
				{value}
				<Typography
					component="span"
					fontSize={20}
					fontWeight={300}
					color={theme.palette.text.secondary}
					sx={{ opacity: 0.3 }}
				>
					#
				</Typography>
			</Stack>
		</Box>
	);
};

StatusBox.propTypes = {
	title: PropTypes.oneOf(["up", "down", "paused"]).isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default StatusBox;
