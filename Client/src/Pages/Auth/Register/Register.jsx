import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepThree } from "./StepThree";
import { networkService } from "../../../main";
import { credentials } from "../../../Validation/validation";
import { createToast } from "../../../Utils/toastUtils";
import { register } from "../../../Features/Auth/authSlice";
import Background from "../../../assets/Images/background-grid.svg?react";
import Mail from "../../../assets/icons/mail.svg?react";
import "../index.css";

/**
 * Displays the initial landing page.
 *
 * @param {Object} props
 * @param {boolean} props.isSuperAdmin - Whether the user is creating and admin account
 * @param {Function} props.onContinue - Callback function to handle "Continue with Email" button click.
 * @returns {JSX.Element}
 */
const LandingPage = ({ isSuperAdmin, onSignup }) => {
	const theme = useTheme();

	return (
		<>
			<Stack
				gap={{ xs: theme.spacing(8), sm: theme.spacing(12) }}
				alignItems="center"
				textAlign="center"
			>
				<Box>
					<Typography component="h1">Sign Up</Typography>
					<Typography>
						Create your {isSuperAdmin ? "Super admin " : ""}account to get started.
					</Typography>
				</Box>
				<Box width="100%">
					<Button
						variant="outlined"
						color="info"
						onClick={onSignup}
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
						Sign up with Email
					</Button>
				</Box>
				<Box maxWidth={400}>
					<Typography className="tos-p">
						By signing up, you agree to our{" "}
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
	isSuperAdmin: PropTypes.bool,
	onSignup: PropTypes.func,
};

const Register = ({ isSuperAdmin }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { token } = useParams();
	const theme = useTheme();
	// TODO If possible, change the IDs of these fields to match the backend
	const idMap = {
		"register-firstname-input": "firstName",
		"register-lastname-input": "lastName",
		"register-email-input": "email",
		"register-password-input": "password",
		"register-confirm-input": "confirm",
	};

	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirm: "",
		role: [],
		teamId: "",
	});
	const [errors, setErrors] = useState({});
	const [step, setStep] = useState(0);

	useEffect(() => {
		const fetchInvite = async () => {
			if (token !== undefined) {
				try {
					const res = await networkService.verifyInvitationToken(token);
					const invite = res.data.data;
					const { role, email, teamId } = invite;
					setForm({ ...form, email, role, teamId });
				} catch (error) {
					navigate("/register", { replace: true });
				}
			}
		};
		fetchInvite();
	}, []);

	/**
	 * Validates the form data against the validation schema.
	 *
	 * @param {Object} data - The form data to validate.
	 * @param {Object} [options] - Optional settings for validation.
	 * @returns {Object | undefined} - Returns the validation error object if there are validation errors; otherwise, `undefined`.
	 */
	const validateForm = (data, options = {}) => {
		const { error } = credentials.validate(data, {
			abortEarly: false,
			...options,
		});
		return error;
	};

	/**
	 * Handles validation errors by setting the state with error messages and displaying a toast notification.
	 *
	 * @param {Object} error - The validation error object returned from the validation schema.
	 */
	const handleError = (error) => {
		const newErrors = {};
		error.details.forEach((err) => {
			newErrors[err.path[0]] = err.message;
		});
		setErrors(newErrors);
		createToast({ body: error.details[0].message || "Error validating data." });
	};

	const handleStepOne = async (e) => {
		e.preventDefault();
		let error = validateForm({
			firstName: form.firstName,
			lastName: form.lastName,
		});

		if (error) {
			handleError(error);
			return;
		}

		setStep(2);
	};

	const handleStepTwo = async (e) => {
		e.preventDefault();

		let error;
		error = validateForm({ email: form.email });
		if (error) {
			handleError(error);
			return;
		}

		setStep(3);
	};

	// Final step
	// Attempts account registration
	const handleStepThree = async (e) => {
		e.preventDefault();
		const { password, confirm } = e.target.elements;
		let registerForm = {
			...form,
			password: password.value,
			confirm: confirm.value,
			role: isSuperAdmin ? ["superadmin"] : form.role,
			inviteToken: token ? token : "", // Add the token to the request for verification
		};
		let error = validateForm(registerForm, {
			context: { password: registerForm.password },
		});
		if (error) {
			handleError(error);
			return;
		}

		delete registerForm.confirm;
		const action = await dispatch(register(registerForm));
		if (action.payload.success) {
			const authToken = action.payload.data;
			localStorage.setItem("token", authToken);
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

	const handleChange = (event) => {
		const { value, id } = event.target;
		const name = idMap[id];
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));

		const { error } = credentials.validate(
			{ [name]: value },
			{ abortEarly: false, context: { password: form.password } }
		);

		setErrors((prev) => {
			const prevErrors = { ...prev };
			if (error) prevErrors[name] = error.details[0].message;
			else delete prevErrors[name];
			return prevErrors;
		});
	};

	return (
		<Stack
			className="register-page auth"
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
				<Stack
					justifyContent="center"
					alignItems="center"
					minWidth={theme.spacing(16)}
					minHeight={theme.spacing(16)}
					pl="1px"
					fontSize={18}
					color="white"
					sx={{
						position: "relative",
						backgroundColor: theme.palette.primary.main,
						borderRadius: theme.shape.borderRadius,
						userSelect: "none",
					}}
				>
					P
				</Stack>
				<Typography sx={{ userSelect: "none" }}>Prism</Typography>
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
					<LandingPage
						isSuperAdmin={isSuperAdmin}
						onSignup={() => setStep(1)}
					/>
				) : step === 1 ? (
					<StepOne
						form={form}
						errors={errors}
						onSubmit={handleStepOne}
						onChange={handleChange}
						onBack={() => setStep(0)}
					/>
				) : step === 2 ? (
					<StepTwo
						form={form}
						errors={errors}
						onSubmit={handleStepTwo}
						onChange={handleChange}
						onBack={() => setStep(1)}
					/>
				) : step === 3 ? (
					<StepThree
						/* form={form}
						errors={errors} */
						onSubmit={handleStepThree}
						/* onChange={handleChange} */
						onBack={() => setStep(2)}
					/>
				) : (
					""
				)}
			</Stack>
			<Box
				textAlign="center"
				p={theme.spacing(12)}
			>
				<Typography display="inline-block">Already have an account? —</Typography>
				<Typography
					component="span"
					ml={theme.spacing(2)}
					onClick={() => {
						navigate("/login");
					}}
					sx={{ userSelect: "none", color: theme.palette.primary.main }}
				>
					Log In
				</Typography>
			</Box>
		</Stack>
	);
};
Register.propTypes = {
	isSuperAdmin: PropTypes.bool,
};
export default Register;
