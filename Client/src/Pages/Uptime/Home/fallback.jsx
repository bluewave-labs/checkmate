import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PlaceholderLight from "../../../assets/Images/data_placeholder.svg?react";
import PlaceholderDark from "../../../assets/Images/data_placeholder_dark.svg?react";
import PropTypes from "prop-types";

const Fallback = ({ isAdmin }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const mode = useSelector((state) => state.ui.mode);

	return (
		<Stack
			alignItems="center"
			backgroundColor={theme.palette.background.main}
			p={theme.spacing(30)}
			pt={theme.spacing(25)}
			gap={theme.spacing(2)}
			border={1}
			borderRadius={theme.shape.borderRadius}
			borderColor={theme.palette.border.light}
			color={theme.palette.text.secondary}
		>
			<Box pb={theme.spacing(20)}>
				{mode === "light" ? <PlaceholderLight /> : <PlaceholderDark />}
			</Box>
			<Typography
				component="h2"
				variant="h2"
				fontWeight={500}
			>
				No monitors found to display
			</Typography>
			<Typography variant="body1">
				It looks like you don’t have any monitors set up yet.
			</Typography>
			{isAdmin && (
				<Button
					variant="contained"
					color="primary"
					onClick={() => {
						navigate("/monitors/create");
					}}
					sx={{ mt: theme.spacing(12) }}
				>
					Create your first monitor
				</Button>
			)}
		</Stack>
	);
};

Fallback.propTypes = {
	isAdmin: PropTypes.bool,
};

export default Fallback;
