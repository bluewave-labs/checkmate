// Components
import { Stack, Typography, Box, Button } from "@mui/material";
import Background from "../../../assets/Images/background-grid.svg?react";
import TextInput from "../../../Components/Inputs/TextInput";
import Check from "../../../Components/Check/Check";

// Utils
import { createToast } from "../../../Utils/toastUtils";
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useValidatePassword } from "../hooks/useValidatePassword";
import { credentials } from "../../../Validation/validation";
import { useDispatch } from "react-redux";
import { register } from "../../../Features/Auth/authSlice";
import { useNavigate } from "react-router-dom";
const Register = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const [handlePasswordChange, feedbacks, passwordForm, passwordErrors] =
		useValidatePassword();

	// Local state
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirm: "",
	});

	const [errors, setErrors] = useState({});
	console.log(passwordErrors);
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		// Handle password
		if (name === "password" || name === "confirm") {
			handlePasswordChange(e);
		}
		setForm((prev) => ({ ...prev, [name]: value }));
		const { error } = credentials.validate({ [name]: value }, { abortEarly: false });
		setErrors((prev) => ({
			...prev,
			...(error ? { [name]: error.details[0].message } : { [name]: undefined }),
		}));
	};

	const handleSubmit = async () => {
		const { error } = credentials.validate(form, {
			abortEarly: false,
			context: { password: form.password }, // Why do we have to do this?
		});
		if (error) {
			const newErrors = {};
			error.details.forEach((err) => {
				newErrors[err.path[0]] = err.message;
			});
			setErrors(newErrors);
			return;
		}

		const registrationForm = {
			firstName: form.firstName,
			lastName: form.lastName,
			email: form.email,
			password: form.password,
			plan: "free",
			role: ["owner", "admin", "user"],
		};
		const action = await dispatch(register(registrationForm));
		if (action.payload.success) {
			navigate("/uptime");
			createToast({
				body: "Welcome! Your account was created successfully.",
			});
		} else {
			if (action.payload) {
				createToast({
					body: action.payload.msg,
				});
			} else {
				createToast({
					body: "Unknown error.",
				});
			}
		}
	};

	return (
		<Stack
			margin="auto"
			maxWidth={400}
			minHeight="100vh"
			spacing={theme.spacing(10)}
			justifyContent="center"
		>
			<Typography
				variant="h1"
				sx={{ alignSelf: "center" }}
			>
				Checkmate
			</Typography>
			<Typography>Create your account to get started</Typography>
			<TextInput
				label="Name"
				name="firstName"
				isRequired={true}
				placeholder="Jordan"
				autoComplete="given-name"
				value={form.firstName}
				onChange={handleFormChange}
				error={errors.firstName ? true : false}
				helperText={errors.firstName}
			/>
			<TextInput
				label="Surname"
				name="lastName"
				isRequired={true}
				placeholder="Ellis"
				autoComplete="family-name"
				value={form.lastName}
				onChange={handleFormChange}
				error={errors.lastName ? true : false}
				helperText={errors.lastName}
			/>
			<TextInput
				type="email"
				name="email"
				label={t("commonEmail")}
				isRequired={true}
				placeholder="jordan.ellis@domain.com"
				autoComplete="email"
				value={form.email}
				onChange={handleFormChange}
				error={errors.email ? true : false}
				helperText={errors.email}
			/>
			<TextInput
				type="password"
				name="password"
				label={t("commonPassword")}
				isRequired={true}
				placeholder={t("createAPassword")}
				autoComplete="current-password"
				value={form.password}
				onChange={handleFormChange}
				error={errors.password ? true : false}
			/>
			<TextInput
				type="password"
				id="register-confirm-input"
				name="confirm"
				label={t("authSetNewPasswordConfirmPassword")}
				isRequired={true}
				placeholder={t("confirmPassword")}
				onChange={handleFormChange}
				error={errors.confirm ? true : false}
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
			<Button
				variant="contained"
				color="accent"
				sx={{ width: "100%" }}
				onClick={handleSubmit}
			>
				Get Started
			</Button>
			<Box
				position="absolute"
				zIndex={-1}
				className="background-pattern-svg"
				sx={{
					"& svg g g:last-of-type path": {
						stroke: theme.palette.primary.lowContrast,
					},
				}}
			>
				<Background style={{ width: "100%" }} />
			</Box>
		</Stack>
	);
};

export default Register;
