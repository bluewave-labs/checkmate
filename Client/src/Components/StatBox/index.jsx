import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/**
 * StatBox Component
 *
 * A reusable component that displays a statistic with a heading and subheading
 * in a styled box with a gradient background.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.heading - The primary heading/title of the statistic
 * @param {string|React.ReactNode} props.subHeading - The value or description of the statistic
 * @param {Object} [props.sx] - Additional custom styling to be applied to the box
 *
 * @example
 * return (
 *   <StatBox
 *     heading="Total Users"
 *     subHeading="1,234"
 *     sx={{ width: 300 }}
 *   />
 * )
 *
 * @returns {React.ReactElement} A styled box containing the statistic
 */

const StatBox = ({ heading, subHeading, sx }) => {
	const theme = useTheme();
	return (
		<Box
			sx={{
				padding: `${theme.spacing(4)} ${theme.spacing(8)}`,
				minWidth: 200,
				width: 225,
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.border.light,
				borderRadius: 4,
				backgroundColor: theme.palette.background.main,
				background: `linear-gradient(340deg, ${theme.palette.background.accent} 20%, ${theme.palette.background.main} 45%)`,
				"& h2": {
					fontSize: 13,
					fontWeight: 500,
					color: theme.palette.text.secondary,
					textTransform: "uppercase",
				},
				"& p": {
					fontSize: 18,
					color: theme.palette.text.primary,
					marginTop: theme.spacing(2),
					"& span": {
						color: theme.palette.text.tertiary,
						marginLeft: theme.spacing(2),
						fontSize: 15,
					},
				},
				...sx,
			}}
		>
			<Typography component="h2">{heading}</Typography>
			<Typography>{subHeading}</Typography>
		</Box>
	);
};

StatBox.propTypes = {
	heading: PropTypes.string.isRequired,
	subHeading: PropTypes.node.isRequired,
	sx: PropTypes.object,
};

export default StatBox;
