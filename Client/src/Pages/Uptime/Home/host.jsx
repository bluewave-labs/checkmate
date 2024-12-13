import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
/**
 * Host component.
 * This subcomponent receives a params object and displays the host details.
 *
 * @component
 * @param {Object} params - An object containing the following properties:
 * @param {string} params.url - The URL of the host.
 * @param {string} params.title - The name of the host.
 * @param {string} params.percentageColor - The color of the percentage text.
 * @param {number} params.percentage - The percentage to display.
 * @returns {React.ElementType} Returns a div element with the host details.
 */
const Host = ({ url, title, percentageColor, percentage }) => {
	const noTitle = title === undefined || title === url;
	return (
		<Box className="host">
			<Box
				display="inline-block"
				position="relative"
				sx={{
					fontWeight: 500,
					"&:before": {
						position: "absolute",
						content: `""`,
						width: "4px",
						height: "4px",
						borderRadius: "50%",
						backgroundColor: "gray",
						opacity: 0.8,
						right: "-10px",
						top: "42%",
					},
				}}
			>
				{title}
			</Box>
			{percentageColor && percentage && (
				<Typography
					component="span"
					sx={{
						color: percentageColor,
						fontWeight: 500,
						ml: "15px",
					}}
				>
					{percentage}%
				</Typography>
			)}
			{!noTitle && <Box sx={{ opacity: 0.6 }}>{url}</Box>}
		</Box>
	);
};

Host.propTypes = {
	title: PropTypes.string,
	percentageColor: PropTypes.string,
	percentage: PropTypes.string,
	url: PropTypes.string,
};

export default Host;
