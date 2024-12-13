import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import TextInput from "../../../../Components/Inputs/TextInput";
import Check from "../../../../Components/Check/Check";
import { useValidatePassword } from "../../hooks/useValidatePassword";

StepThree.propTypes = {
	onSubmit: PropTypes.func,
	onBack: PropTypes.func,
};

/**
 * Renders the third step of the sign up process.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onBack - Callback function to handle "Back" button click.
 * @returns {JSX.Element}
 */
function StepThree({ onSubmit, onBack }) {
	const theme = useTheme();
	const inputRef = useRef(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const { handleChange, feedbacks, form, errors } = useValidatePassword();
	return (
		<>
			<Stack
				gap={{ xs: theme.spacing(8), sm: theme.spacing(12) }}
				textAlign="center"
			>
				<Box>
					<Typography component="h1">Sign Up</Typography>
					<Typography>Create your password</Typography>
				</Box>
				<Box
					component="form"
					noValidate
					spellCheck={false}
					onSubmit={onSubmit}
					textAlign="left"
					display="grid"
					gap={{ xs: theme.spacing(12), sm: theme.spacing(16) }}
					sx={{
						"& .input-error": {
							display: "none",
						},
					}}
				>
					<Box
						display="grid"
						gap={{ xs: theme.spacing(8), sm: theme.spacing(12) }}
					>
						<TextInput
							type="password"
							id="register-password-input"
							name="password"
							label="Password"
							isRequired={true}
							placeholder="Create a password"
							autoComplete="current-password"
							value={form.password}
							onChange={handleChange}
							error={errors.password && errors.password[0] ? true : false}
							ref={inputRef}
						/>
						<TextInput
							type="password"
							id="register-confirm-input"
							name="confirm"
							label="Confirm password"
							isRequired={true}
							placeholder="Confirm your password"
							autoComplete="current-password"
							value={form.confirm}
							onChange={handleChange}
							error={errors.confirm && errors.confirm[0] ? true : false}
						/>
					</Box>
					<Stack
						gap={theme.spacing(4)}
						mb={{ xs: theme.spacing(6), sm: theme.spacing(8) }}
					>
						<Check
							noHighlightText={"Must be at least"}
							text={"8 characters long"}
							variant={feedbacks.length}
						/>
						<Check
							noHighlightText={"Must contain at least"}
							text={"one special character"}
							variant={feedbacks.special}
						/>
						<Check
							noHighlightText={"Must contain at least"}
							text={"one number"}
							variant={feedbacks.number}
						/>
						<Check
							noHighlightText={"Must contain at least"}
							text={"one upper character"}
							variant={feedbacks.uppercase}
						/>
						<Check
							noHighlightText={"Must contain at least"}
							text={"one lower character"}
							variant={feedbacks.lowercase}
						/>
						<Check
							noHighlightText={"Confirm password and password"}
							text={"must match"}
							variant={feedbacks.confirm}
						/>
					</Stack>
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
								":focus-visible": {
									outline: `2px solid ${theme.palette.primary.dark}`,
									outlineOffset: "4px",
								},
							}}
						>
							<ArrowBackRoundedIcon />
							Back
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={
								form.password.length === 0 ||
								form.confirm.length === 0 ||
								Object.keys(errors).length !== 0
							}
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
						</Button>
					</Stack>
				</Box>
			</Stack>
		</>
	);
}

export { StepThree };
