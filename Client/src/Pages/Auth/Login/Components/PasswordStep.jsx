import { useRef, useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useSelector } from "react-redux";
import TextInput from "../../../../Components/Inputs/TextInput";
import { PasswordEndAdornment } from "../../../../Components/Inputs/TextInput/Adornments";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PropTypes from "prop-types";

/**
 * Renders the password step of the login process, including a password input field.
 *
 * @param {Object} props
 * @param {Object} props.form - Form state object.
 * @param {Object} props.errors - Object containing form validation errors.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onChange - Callback function to handle form input changes.
 * @param {Function} props.onBack - Callback function to handle "Back" button click.
 * @returns {JSX.Element}
 */
const PasswordStep = ({ form, errors, onSubmit, onChange, onBack }) => {
	const theme = useTheme();
	const inputRef = useRef(null);
	const authState = useSelector((state) => state.auth);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<>
			<Stack
				gap={{ xs: theme.spacing(12), sm: theme.spacing(16) }}
				position="relative"
				textAlign="center"
			>
				<Box>
					<Typography component="h1">Log In</Typography>
					<Typography>Enter your password</Typography>
				</Box>
				<Box
					component="form"
					noValidate
					spellCheck={false}
					onSubmit={onSubmit}
					textAlign="left"
					mb={theme.spacing(5)}
					sx={{
						display: "grid",
						gap: { xs: theme.spacing(12), sm: theme.spacing(16) },
					}}
				>
					<TextInput
						type="password"
						id="login-password-input"
						label="Password"
						isRequired={true}
						placeholder="••••••••••"
						autoComplete="current-password"
						value={form.password}
						onChange={onChange}
						error={errors.password ? true : false}
						helperText={errors.password}
						ref={inputRef}
						endAdornment={<PasswordEndAdornment />}
					/>
					<Stack
						direction="row"
						justifyContent="space-between"
					>
						<Button
							variant="outlined"
							color="info"
							onClick={onBack}
							sx={{
								px: theme.spacing(5),
								"& svg.MuiSvgIcon-root": {
									mr: theme.spacing(3),
								},
								"&:focus-visible": {
									outline: `2px solid ${theme.palette.primary.main}`,
									outlineOffset: `2px`,
								},
							}}
						>
							<ArrowBackRoundedIcon />
							Back
						</Button>
						<LoadingButton
							variant="contained"
							color="primary"
							type="submit"
							loading={authState.isLoading}
							disabled={errors.password && true}
							sx={{
								width: "30%",
								"&.Mui-focusVisible": {
									outline: `2px solid ${theme.palette.primary.main}`,
									outlineOffset: `2px`,
									boxShadow: `none`,
								},
							}}
						>
							Continue
						</LoadingButton>
					</Stack>
				</Box>
			</Stack>
		</>
	);
};

PasswordStep.propTypes = {
	form: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
};

export default PasswordStep;
