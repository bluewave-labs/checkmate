import { useId } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { Box, Stack, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { setNewPassword } from "../../Features/Auth/authSlice";
import { createToast } from "../../Utils/toastUtils";
import { credentials } from "../../Validation/validation";
import Check from "../../Components/Check/Check";
import TextInput from "../../Components/Inputs/TextInput";
import { PasswordEndAdornment } from "../../Components/Inputs/TextInput/Adornments";
import IconBox from "../../Components/IconBox";
import LockIcon from "../../assets/icons/lock.svg?react";
import Logo from "../../assets/icons/bwu-icon.svg?react";
import Background from "../../assets/Images/background-grid.svg?react";
import "./index.css";
import { useValidatePassword } from "./hooks/useValidatePassword";
import { useTranslation } from "react-i18next";

const SetNewPassword = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const theme = useTheme();
	const { t } = useTranslation();

	const passwordId = useId();
	const confirmPasswordId = useId();

	const { form, errors, handleChange, feedbacks } = useValidatePassword();

	const { isLoading } = useSelector((state) => state.auth);
	const { token } = useParams();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const { error } = credentials.validate(form, {
			abortEarly: false,
			context: { password: form.password },
		});

		if (error) {
			createToast({
				body:
					error.details && error.details.length > 0
						? error.details[0].message
						: "Error validating data.",
			});
		} else {
			const action = await dispatch(setNewPassword({ token, form }));
			if (action.payload.success) {
				navigate("/new-password-confirmed");
				createToast({
					body: "Your password was reset successfully.",
				});
			} else {
				const errorMessage = action.payload
					? action.payload.msg
					: "Unable to reset password. Please try again later or contact support.";
				createToast({
					body: errorMessage,
				});
			}
		}
	};

	return (
		<Stack
			className="set-new-password-page auth"
			overflow="hidden"
			sx={{
				"& h1": {
					color: theme.palette.primary.main,
					fontWeight: 600,
					fontSize: 24,
				},
				"& p": {
					fontSize: 14,
					color: theme.palette.text.accent,
				},
			}}
		>
			<Box
				className="background-pattern-svg"
				sx={{
					"& svg g g:last-of-type path": {
						stroke: theme.palette.border.light,
					},
				}}
			>
				<Background style={{ width: "100%" }} />
			</Box>
			<Stack
				direction="row"
				alignItems="center"
				px={theme.spacing(12)}
				gap={theme.spacing(4)}
			>
				<Logo style={{ borderRadius: theme.shape.borderRadius }} />
				<Typography sx={{ userSelect: "none" }}>{t("commonAppName")}</Typography>
			</Stack>
			<Stack
				width="100%"
				maxWidth={600}
				flex={1}
				justifyContent="center"
				px={{ xs: theme.spacing(12), lg: theme.spacing(20) }}
				pb={theme.spacing(12)}
				mx="auto"
				sx={{
					"& > .MuiStack-root": {
						border: 1,
						borderRadius: theme.spacing(5),
						borderColor: theme.palette.border.light,
						backgroundColor: theme.palette.background.main,
						padding: {
							xs: theme.spacing(12),
							sm: theme.spacing(20),
						},
					},
				}}
			>
				<Stack
					gap={{ xs: theme.spacing(8), sm: theme.spacing(12) }}
					alignItems="center"
					textAlign="center"
				>
					<Box>
						<Stack
							direction="row"
							justifyContent="center"
						>
							<IconBox
								height={48}
								width={48}
								minWidth={48}
								borderRadius={12}
								svgWidth={24}
								svgHeight={24}
								mb={theme.spacing(4)}
							>
								<LockIcon alt="lock icon" />
							</IconBox>
						</Stack>
						<Typography component="h1">{t("authSetNewPasswordTitle")}</Typography>
						<Typography>{t("authSetNewPasswordDescription")}</Typography>
					</Box>
					<Box
						component="form"
						width="95%"
						textAlign="left"
						noValidate
						spellCheck={false}
						onSubmit={handleSubmit}
					>
						<TextInput
							type="password"
							id={passwordId}
							label={t("authSetNewPasswordNewPassword")}
							isRequired={true}
							placeholder={t("authSetNewPasswordEnterNewPassword")}
							value={form.password}
							onChange={handleChange}
							error={errors.password && errors.password[0] ? true : false}
							helperText={errors.password && errors.password[0]}
							fullWidth
							sx={{ mb: theme.spacing(8) }}
							endAdornment={<PasswordEndAdornment />}
						/>
						<TextInput
							type="password"
							id={confirmPasswordId}
							label={t("authSetNewPasswordConfirmPassword")}
							isRequired={true}
							placeholder={t("authSetNewPasswordReenterPassword")}
							value={form.confirm}
							onChange={handleChange}
							error={errors.confirm && errors.confirm[0] ? true : false}
							helperText={errors.confirm && errors.confirm[0]}
							fullWidth
							sx={{ mb: theme.spacing(8) }}
							endAdornment={<PasswordEndAdornment />}
						/>
						<Stack
							gap={theme.spacing(4)}
							mb={{ xs: theme.spacing(6), sm: theme.spacing(8) }}
						>
							<Check
								noHighlightText={t("authPasswordMustBeAtLeast")}
								text={t("authPasswordCharactersLong")}
								variant={feedbacks.length}
							/>
							<Check
								noHighlightText={t("authPasswordMustContainAtLeast")}
								text={t("authPasswordSpecialCharacter")}
								variant={feedbacks.special}
							/>
							<Check
								noHighlightText={t("authPasswordMustContainAtLeast")}
								text={t("authPasswordOneNumber")}
								variant={feedbacks.number}
							/>
							<Check
								noHighlightText={t("authPasswordMustContainAtLeast")}
								text={t("authPasswordUpperCharacter")}
								variant={feedbacks.uppercase}
							/>
							<Check
								noHighlightText={t("authPasswordMustContainAtLeast")}
								text={t("authPasswordLowerCharacter")}
								variant={feedbacks.lowercase}
							/>
							<Check
								noHighlightText={t("authPasswordConfirmAndPassword")}
								text={t("authPasswordMustMatch")}
								variant={feedbacks.confirm}
							/>
						</Stack>
						<LoadingButton
							type="submit"
							variant="contained"
							fullWidth
							loading={isLoading}
							disabled={
								form.password.length === 0 ||
								form.confirm.length === 0 ||
								Object.keys(errors).length !== 0
							}
						>
							{t("authSetNewPasswordResetPassword")}
						</LoadingButton>
					</Box>
				</Stack>
			</Stack>
			<Box
				textAlign="center"
				p={theme.spacing(12)}
			>
				<Typography display="inline-block">{t("authSetNewPasswordBackTo")}</Typography>
				<Typography
					component="span"
					ml={theme.spacing(2)}
					onClick={() => navigate("/login")}
					sx={{ userSelect: "none", color: theme.palette.primary.main }}
				>
					{t("authLoginTitle")}
				</Typography>
			</Box>
		</Stack>
	);
};

export default SetNewPassword;
