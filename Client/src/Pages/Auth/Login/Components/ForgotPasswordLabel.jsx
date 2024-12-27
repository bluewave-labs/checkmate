import { Box, Typography, useTheme } from "@mui/material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";

const ForgotPasswordLabel = ({ email, errorEmail }) => {
	const theme = useTheme();
	const navigate = useNavigate();

	const handleNavigate = () => {
		if (email !== "" && !errorEmail) {
			sessionStorage.setItem("email", email);
		}
		navigate("/forgot-password");
	};

	return (
		<Box textAlign="center">
			<Typography
				className="forgot-p"
				display="inline-block"
				color={theme.palette.primary.main}
			>
				Forgot password?
			</Typography>
			<Typography
				component="span"
				color={theme.palette.primary.main}
				ml={theme.spacing(2)}
				sx={{ userSelect: "none" }}
				onClick={handleNavigate}
			>
				Reset password
			</Typography>
		</Box>
	);
};

ForgotPasswordLabel.proptype = {
	email: PropTypes.string.isRequired,
	emailError: PropTypes.string.isRequired,
};

export default ForgotPasswordLabel;
