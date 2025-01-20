import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { createToast } from "../../Utils/toastUtils";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../Features/Auth/authSlice";
import { useEffect, useState } from "react";
import { credentials } from "../../Validation/validation";
import { useNavigate } from "react-router-dom";
import TextInput from "../../Components/Inputs/TextInput";
import Key from "../../assets/icons/key.svg?react";
import Background from "../../assets/Images/background-grid.svg?react";
import LoadingButton from "@mui/lab/LoadingButton";
import IconBox from "../../Components/IconBox";
import "./index.css";

const ForgotPassword = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const theme = useTheme();

	const { isLoading } = useSelector((state) => state.auth);
	const [errors, setErrors] = useState({});
	const [form, setForm] = useState({
		email: "",
	});

	useEffect(() => {
		const email = sessionStorage.getItem("email");
		email && setForm({ email: sessionStorage.getItem("email") });
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();

		const { error } = credentials.validate(form, { abortEarly: false });

		if (error) {
			// validation errors
			const err =
				error.details && error.details.length > 0
					? error.details[0].message
					: "Error validating data.";
			setErrors({ email: err });
			createToast({
				body: err,
			});
		} else {
			const action = await dispatch(forgotPassword(form));
			if (action.payload.success) {
				sessionStorage.setItem("email", form.email);
				navigate("/check-email");
				createToast({
					body: `Instructions sent to ${form.email}.`,
				});
			} else {
				if (action.payload) {
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
	};

	const handleChange = (event) => {
		const { value } = event.target;
		setForm({ email: value });

		const { error } = credentials.validate({ email: value }, { abortEarly: false });

		if (error) setErrors({ email: error.details[0].message });
		else delete errors.email;
	};

	const handleNavigate = () => {
		sessionStorage.removeItem("email");
		navigate("/login");
	};

	return (
		<Stack
			className="forgot-password-page auth"
			overflow="hidden"
			sx={{
				"& h1": {
					color: theme.palette.primary.main,
					fontWeight: 600,
					fontSize: 21,
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
								<Key alt="password key icon" />
							</IconBox>
						</Stack>
						<Typography component="h1">Forgot password?</Typography>
						<Typography>No worries, we&apos;ll send you reset instructions.</Typography>
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
							type="email"
							id="forgot-password-email-input"
							label="Email"
							isRequired={true}
							placeholder="Enter your email"
							value={form.email}
							onChange={handleChange}
							error={errors.email ? true : false}
							helperText={errors.email}
						/>
						<LoadingButton
							variant="contained"
							color="primary"
							loading={isLoading}
							disabled={errors.email !== undefined}
							onClick={handleSubmit}
							sx={{
								width: "100%",
								mt: theme.spacing(15),
							}}
						>
							Send instructions
						</LoadingButton>
					</Box>
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
					onClick={handleNavigate}
					sx={{ userSelect: "none" }}
				>
					Log In
				</Typography>
			</Box>
		</Stack>
	);
};

export default ForgotPassword;
