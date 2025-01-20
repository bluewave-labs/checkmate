import { Box, Typography, useTheme } from "@mui/material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useTranslate } from "@tolgee/react";

const ForgotPasswordLabel = ({ email, errorEmail }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { t } = useTranslate();

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
				onClick={handleNavigate}
				sx={{ cursor: "pointer" }}
			>
				{t("login.forgotPassword")}
			</Typography>
		</Box>
	);
};

ForgotPasswordLabel.propTypes = {
	email: PropTypes.string.isRequired,
	errorEmail: PropTypes.string,
};

export default ForgotPasswordLabel;
