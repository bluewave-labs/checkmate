import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { credentials } from "../../Validation/validation";
import { login } from "../../Features/Auth/authSlice";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import { createToast } from "../../Utils/toastUtils";
import { networkService } from "../../main";
import TextInput from "../../Components/Inputs/TextInput";
import { PasswordEndAdornment } from "../../Components/Inputs/TextInput/Adornments";
import Background from "../../assets/Images/background-grid.svg?react";
import Logo from "../../assets/icons/bwu-icon.svg?react";
import Mail from "../../assets/icons/mail.svg?react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PropTypes from "prop-types";
import { logger } from "../../Utils/Logger";
import "./index.css";
const DEMO = import.meta.env.VITE_APP_DEMO;

/**
 * Displays the initial landing page.
 *
 * @param {Object} props
 * @param {Function} props.onContinue - Callback function to handle "Continue with Email" button click.
 * @returns {JSX.Element}
 */
const LandingPage = ({ onContinue }) => {
	const theme = useTheme();

	return (
		<>
			<Stack
				gap={{ xs: theme.spacing(8), sm: theme.spacing(12) }}
				alignItems="center"
				textAlign="center"
			>
				<Box>
					<Typography component="h1">Log In</Typography>
					<Typography>We are pleased to see you again!</Typography>
				</Box>
				<Box width="100%">
					<Button
						variant="outlined"
						color="info"
						onClick={onContinue}
						sx={{
							width: "100%",
							"& svg": {
								mr: theme.spacing(4),
								"& path": {
									stroke: theme.palette.other.icon,
								},
							},
							"&:focus-visible": {
								outline: `2px solid ${theme.palette.primary.main}`,
								outlineOffset: `2px`,
							},
						}}
					>
						<Mail />
						Continue with Email
					</Button>
				</Box>
				<Box maxWidth={400}>
					<Typography className="tos-p">
						By continuing, you agree to our{" "}
						<Typography
							component="span"
							onClick={() => {
								window.open(
									"https://bluewavelabs.ca/terms-of-service-open-source",
									"_blank",
									"noreferrer"
								);
							}}
							sx={{
								"&:hover": {
									color: theme.palette.text.tertiary,
								},
							}}
						>
							Terms of Service
						</Typography>{" "}
						and{" "}
						<Typography
							component="span"
							onClick={() => {
								window.open(
									"https://bluewavelabs.ca/privacy-policy-open-source",
									"_blank",
									"noreferrer"
								);
							}}
							sx={{
								"&:hover": {
									color: theme.palette.text.tertiary,
								},
							}}
						>
							Privacy Policy.
						</Typography>
					</Typography>
				</Box>
			</Stack>
		</>
	);
};

LandingPage.propTypes = {
	onContinue: PropTypes.func.isRequired,
};

/**
 * Renders the first step of the login process.
 *
 * @param {Object} props
 * @param {Object} props.form - Form state object.
 * @param {Object} props.errors - Object containing form validation errors.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onChange - Callback function to handle form input changes.
 * @param {Function} props.onBack - Callback function to handle "Back" button click.
 * @returns {JSX.Element}
 */
const StepOne = ({ form, errors, onSubmit, onChange, onBack }) => {
	const theme = useTheme();
	const inputRef = useRef(null);

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
			>
				<Box>
					<Typography component="h1">Log In</Typography>
					<Typography>Enter your email address</Typography>
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
						label="Email"
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
							Continue
						</Button>
					</Stack>
				</Box>
			</Stack>
		</>
	);
};

StepOne.propTypes = {
	form: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
};

/**
 * Renders the second step of the login process, including a password input field.
 *
 * @param {Object} props
 * @param {Object} props.form - Form state object.
 * @param {Object} props.errors - Object containing form validation errors.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onChange - Callback function to handle form input changes.
 * @param {Function} props.onBack - Callback function to handle "Back" button click.
 * @returns {JSX.Element}
 */
const StepTwo = ({ form, errors, onSubmit, onChange, onBack }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const inputRef = useRef(null);
	const authState = useSelector((state) => state.auth);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const handleNavigate = () => {
		if (form.email !== "" && !errors.email) {
			sessionStorage.setItem("email", form.email);
		}
		navigate("/forgot-password");
	};

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
				<Box
					textAlign="center"
					sx={{
						position: "absolute",
						bottom: 0,
						left: "50%",
						transform: `translate(-50%, 150%)`,
					}}
				>
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
			</Stack>
		</>
	);
};

StepTwo.propTypes = {
	form: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
};

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

		if (step === 1) {
			const { error } = credentials.validate(
				{ email: form.email },
				{ abortEarly: false }
			);
			if (error) {
				setErrors((prev) => ({ ...prev, email: error.details[0].message }));
				createToast({ body: error.details[0].message });
			} else {
				setStep(2);
			}
		} else if (step === 2) {
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
					<LandingPage onContinue={() => setStep(1)} />
				) : step === 1 ? (
					<StepOne
						form={form}
						errors={errors}
						onSubmit={handleSubmit}
						onChange={handleChange}
						onBack={() => setStep(0)}
					/>
				) : (
					step === 2 && (
						<StepTwo
							form={form}
							errors={errors}
							onSubmit={handleSubmit}
							onChange={handleChange}
							onBack={() => setStep(1)}
						/>
					)
				)}
			</Stack>
		</Stack>
	);
};

export default Login;
