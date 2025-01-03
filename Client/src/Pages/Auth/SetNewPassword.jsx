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

const SetNewPassword = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const theme = useTheme();

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
				<Typography sx={{ userSelect: "none" }}>BlueWave Uptime</Typography>
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
						<Typography component="h1">Set new password</Typography>
						<Typography>
							Your new password must be different to previously used passwords.
						</Typography>
					</Box>
					<Box
						width="100%"
						textAlign="left"
						sx={{
							"& .input-error": {
								display: "none",
							},
						}}
					>
						<Box
							component="form"
							noValidate
							spellCheck={false}
							onSubmit={handleSubmit}
						>
							<TextInput
								id={passwordId}
								type="password"
								name="password"
								label="Password"
								isRequired={true}
								placeholder="••••••••"
								value={form.password}
								onChange={handleChange}
								error={errors.password ? true : false}
								helperText={errors.password}
								endAdornment={<PasswordEndAdornment />}
							/>
						</Box>
						<Box
							component="form"
							noValidate
							spellCheck={false}
							onSubmit={handleSubmit}
						>
							<TextInput
								id={confirmPasswordId}
								type="password"
								name="confirm"
								label="Confirm password"
								isRequired={true}
								placeholder="••••••••"
								value={form.confirm}
								onChange={handleChange}
								error={errors.confirm ? true : false}
								helperText={errors.confirm}
								endAdornment={<PasswordEndAdornment />}
							/>
						</Box>
						<Stack
							gap={theme.spacing(4)}
							mb={theme.spacing(12)}
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
					</Box>
					<LoadingButton
						variant="contained"
						color="primary"
						loading={isLoading}
						onClick={handleSubmit}
						disabled={
							form.password.length === 0 ||
							form.confirm.length === 0 ||
							Object.keys(errors).length !== 0
						}
						sx={{ width: "100%", maxWidth: 400 }}
					>
						Reset password
					</LoadingButton>
				</Stack>
			</Stack>
			<Box
				textAlign="center"
				p={theme.spacing(12)}
			>
				<Typography display="inline-block">Go back to —</Typography>
				<Typography
					component="span"
					color={theme.palette.primary.main}
					ml={theme.spacing(2)}
					onClick={() => navigate("/login")}
					sx={{ userSelect: "none" }}
				>
					Log In
				</Typography>
			</Box>
		</Stack>
	);
};

export default SetNewPassword;
