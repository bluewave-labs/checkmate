import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { credentials } from "../../../Validation/validation";
import { login } from "../../../Features/Auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { createToast } from "../../../Utils/toastUtils";
import { networkService } from "../../../main";
import Background from "../../../assets/Images/background-grid.svg?react";
import Logo from "../../../assets/icons/bwu-icon.svg?react";
import { logger } from "../../../Utils/Logger";
import "../index.css";
import EmailStep from "./Components/EmailStep";
import PasswordStep from "./Components/PasswordStep";
import ThemeSwitch from "../../../Components/ThemeSwitch";
import ForgotPasswordLabel from "./Components/ForgotPasswordLabel";

const DEMO = import.meta.env.VITE_APP_DEMO;

/**
 * Displays the login page.
 */

const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const theme = useTheme();

	const authState = useSelector((state) => state.auth);
	const { authToken } = authState;

	const idMap = {
		"login-email-input": "email",
		"login-password-input": "password",
	};

	const [form, setForm] = useState({
		email: DEMO !== undefined ? "uptimedemo@demo.com" : "",
		password: DEMO !== undefined ? "Demouser1!" : "",
	});
	const [errors, setErrors] = useState({});
	const [step, setStep] = useState(0);

	useEffect(() => {
		if (authToken) {
			navigate("/uptime");
			return;
		}
		networkService
			.doesSuperAdminExist()
			.then((response) => {
				if (response.data.data === false) {
					navigate("/register");
				}
			})
			.catch((error) => {
				logger.error(error);
			});
	}, [authToken, navigate]);

	const handleChange = (event) => {
		const { value, id } = event.target;
		const name = idMap[id];
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));

		const { error } = credentials.validate({ [name]: value }, { abortEarly: false });

		setErrors((prev) => {
			const prevErrors = { ...prev };
			if (error) prevErrors[name] = error.details[0].message;
			else delete prevErrors[name];
			return prevErrors;
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (step === 0) {
			const { error } = credentials.validate(
				{ email: form.email },
				{ abortEarly: false }
			);
			if (error) {
				setErrors((prev) => ({ ...prev, email: error.details[0].message }));
				createToast({ body: error.details[0].message });
			} else {
				setStep(1);
			}
		} else if (step === 1) {
			const { error } = credentials.validate(form, { abortEarly: false });

			if (error) {
				// validation errors
				const newErrors = {};
				error.details.forEach((err) => {
					newErrors[err.path[0]] = err.message;
				});
				setErrors(newErrors);
				createToast({
					body:
						error.details && error.details.length > 0
							? error.details[0].message
							: "Error validating data.",
				});
			} else {
				const action = await dispatch(login(form));
				if (action.payload.success) {
					navigate("/uptime");
					createToast({
						body: "Welcome back! You're successfully logged in.",
					});
				} else {
					if (action.payload) {
						if (action.payload.msg === "Incorrect password")
							setErrors({
								password: "The password you provided does not match our records",
							});
						// dispatch errors
						createToast({
							body: action.payload.msg,
						});
					} else {
						// unknown errors
						createToast({
							body: "Unknown error.",
						});
					}
				}
			}
		}
	};

	return (
		<Stack
			className="login-page auth"
			overflow="hidden"
			sx={{
				"& h1": {
					color: theme.palette.primary.main,
					fontWeight: 600,
					fontSize: 28,
				},
				"& p": { fontSize: 14, color: theme.palette.text.accent },
				"& span": { fontSize: "inherit" },
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
				pb={theme.spacing(20)}
				mx="auto"
				rowGap={theme.spacing(8)}
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
				{step === 0 ? (
					<EmailStep
						form={form}
						errors={errors}
						onSubmit={handleSubmit}
						onChange={handleChange}
					/>
				) : (
					step === 1 && (
						<PasswordStep
							form={form}
							errors={errors}
							onSubmit={handleSubmit}
							onChange={handleChange}
							onBack={() => setStep(0)}
						/>
					)
				)}
				<ForgotPasswordLabel
					email={form.email}
					errorEmail={errors.email}
				/>
				<Box marginX={"auto"}>
					<ThemeSwitch />
				</Box>
			</Stack>
		</Stack>
	);
};

export default Login;
