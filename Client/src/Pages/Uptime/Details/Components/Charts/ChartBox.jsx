import { Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import IconBox from "../../../../../Components/IconBox";
import PropTypes from "prop-types";
const ChartBox = ({ children, icon, header, height = "300px" }) => {
	const theme = useTheme();
	return (
		<Stack
			sx={{
				justifyContent: "space-between",
				flex: "1 30%",
				gap: theme.spacing(8),
				height,
				minWidth: 250,
				padding: theme.spacing(8),
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.primary.lowContrast,
				borderRadius: 4,
				backgroundColor: theme.palette.primary.main,
				"& h2": {
					color: theme.palette.primary.contrastTextSecondary,
					fontSize: 15,
					fontWeight: 500,
				},
				"& .MuiBox-root:not(.area-tooltip) p": {
					color: theme.palette.primary.contrastTextTertiary,
					fontSize: 13,
				},
				"& .MuiBox-root > span": {
					color: theme.palette.primary.contrastText,
					fontSize: 20,
					"& span": {
						opacity: 0.8,
						marginLeft: 2,
						fontSize: 15,
					},
				},
				"& .MuiStack-root": {
					flexDirection: "row",
					gap: theme.spacing(6),
				},
				"& .MuiStack-root:first-of-type": {
					alignItems: "center",
				},
				"& tspan, & text": {
					fill: theme.palette.primary.contrastTextTertiary,
				},
				"& path": {
					transition: "fill 300ms ease, stroke-width 400ms ease",
				},
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				gap={theme.spacing(2)}
			>
				<IconBox>{icon}</IconBox>
				<Typography component="h2">{header}</Typography>
			</Stack>

			{children}
		</Stack>
	);
};

export default ChartBox;

ChartBox.propTypes = {
	children: PropTypes.node,
	icon: PropTypes.node.isRequired,
	header: PropTypes.string.isRequired,
	height: PropTypes.string,
};
