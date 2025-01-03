import { useTheme } from "@emotion/react";
import PlaceholderLight from "../../../assets/Images/data_placeholder.svg?react";
import PlaceholderDark from "../../../assets/Images/data_placeholder_dark.svg?react";
import { Box, Typography, Stack } from "@mui/material";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
const Empty = ({ styles }) => {
	const theme = useTheme();
	const mode = useSelector((state) => state.ui.mode);
	return (
		<Box sx={{ ...styles, marginTop: theme.spacing(24) }}>
			<Stack
				direction="column"
				gap={theme.spacing(8)}
				alignItems="center"
			>
				{mode === "light" ? <PlaceholderLight /> : <PlaceholderDark />}

				<Typography variant="h2">Your infrastructure dashboard will show here</Typography>
				<Typography
					textAlign="center"
					color={theme.palette.text.secondary}
				>
					Hang tight! Data is loading
				</Typography>
			</Stack>
		</Box>
	);
};

Empty.propTypes = {
	styles: PropTypes.object,
	mode: PropTypes.string,
};

export default Empty;
