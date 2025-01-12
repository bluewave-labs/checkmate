import { useTheme } from "@emotion/react";
import PlaceholderLight from "../../../../assets/Images/data_placeholder.svg?react";
import PlaceholderDark from "../../../../assets/Images/data_placeholder_dark.svg?react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const Empty = ({ styles, mode }) => {
	const theme = useTheme();
	return (
		<Box sx={{ ...styles }}>
			<Box
				textAlign="center"
				pb={theme.spacing(20)}
			>
				{mode === "light" ? <PlaceholderLight /> : <PlaceholderDark />}
			</Box>
			<Typography
				textAlign="center"
				color={theme.palette.primary.contrastTextSecondary}
			>
				No incidents recorded yet.
			</Typography>
		</Box>
	);
};

Empty.propTypes = {
	styles: PropTypes.object,
	mode: PropTypes.string,
};

export { Empty };
