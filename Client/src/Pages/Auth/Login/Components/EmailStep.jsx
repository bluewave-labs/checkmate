import { useRef, useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import TextInput from "../../../../Components/Inputs/TextInput";
import PropTypes from "prop-types";
import { useTranslate } from "@tolgee/react";

/**
 * Renders the email step of the login process which includes an email field.
 *
 * @param {Object} props
 * @param {Object} props.form - Form state object.
 * @param {Object} props.errors - Object containing form validation errors.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onChange - Callback function to handle form input changes.
 * @returns {JSX.Element}
 */
const EmailStep = ({ form, errors, onSubmit, onChange }) => {
	const theme = useTheme();
	const inputRef = useRef(null);
	const { t } = useTranslate();

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<>
			<Stack
				gap={{ xs: theme.spacing(12), sm: theme.spacing(16) }}
				textAlign="center"
				position="relative"
			>
				<Box>
					<Typography component="h1">{t("login.title")}</Typography>
					<Typography>{t("login.email")}</Typography>
				</Box>
				<Box
					textAlign="left"
					component="form"
					noValidate
					spellCheck={false}
					onSubmit={onSubmit}
					display="grid"
					gap={{ xs: theme.spacing(12), sm: theme.spacing(16) }}
				>
					<TextInput
						type="email"
						id="login-email-input"
						label={t("login.email")}
						isRequired={true}
						placeholder="jordan.ellis@domain.com"
						autoComplete="email"
						value={form.email}
						onInput={(e) => (e.target.value = e.target.value.toLowerCase())}
						onChange={onChange}
						error={errors.email ? true : false}
						helperText={errors.email}
						ref={inputRef}
					/>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography
							variant="body2"
							color="textSecondary"
						>
							{t("login.dontHaveAccount")}{" "}
							<Typography
								component="a"
								href="/register"
								color="primary"
								sx={{ textDecoration: "none" }}
							>
								{t("login.signUp")}
							</Typography>
						</Typography>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							disabled={errors.email && true}
							sx={{
								width: "30%",
								"&.Mui-focusVisible": {
									outline: `2px solid ${theme.palette.primary.main}`,
									outlineOffset: `2px`,
									boxShadow: `none`,
								},
							}}
						>
							{t("login.submit")}
						</Button>
					</Stack>
				</Box>
			</Stack>
		</>
	);
};

EmailStep.propTypes = {
	form: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default EmailStep;
