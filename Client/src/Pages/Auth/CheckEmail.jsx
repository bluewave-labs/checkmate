import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { createToast } from "../../Utils/toastUtils";
import { forgotPassword } from "../../Features/Auth/authSlice";
import Background from "../../assets/Images/background-grid.svg?react";
import EmailIcon from "../../assets/icons/email.svg?react";
import IconBox from "../../Components/IconBox";
import "./index.css";

const CheckEmail = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [email, setEmail] = useState();
	const [disabled, setDisabled] = useState(false);
	useEffect(() => {
		setEmail(sessionStorage.getItem("email"));
	}, []);

	// TODO - fix
	const openMail = () => {
		window.location.href = "mailto:";
	};

	const toastFail = [
		{
			body: "Email not found.",
		},
		{
			body: "Redirecting in 3...",
		},
		{
			body: "Redirecting in 2...",
		},
		{
			body: "Redirecting in 1...",
		},
	];

	const resendToken = async () => {
		setDisabled(true); // prevent resent button from being spammed
		if (!email) {
			let index = 0;
			const interval = setInterval(() => {
				if (index < toastFail.length) {
					createToast(toastFail[index]);
					index++;
				} else {
					clearInterval(interval);
					navigate("/forgot-password");
				}
			}, 1000);
		} else {
			const form = { email: email };
			const action = await dispatch(forgotPassword(form));
			if (action.payload.success) {
				createToast({
					body: `Instructions sent to ${form.email}.`,
				});
				setDisabled(false);
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

	const handleNavigate = () => {
		sessionStorage.removeItem("email");
		navigate("/login");
	};

	return (
		<Stack
			className="check-email-page auth"
			overflow="hidden"
			sx={{
				"& h1": {
					color: theme.palette.primary.main,
					fontWeight: 600,
					fontSize: 22,
				},
				"& p": { color: theme.palette.text.accent, fontSize: 13.5 },
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
				<Stack
					gap={{ xs: theme.spacing(8), sm: theme.spacing(10) }}
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
								<EmailIcon alt="email icon" />
							</IconBox>
						</Stack>
						<Typography component="h1">Check your email</Typography>
						<Typography>
							We sent a password reset link to{" "}
							<Typography
								className="email-sent-to"
								component="span"
							>
								{email || "username@email.com"}
							</Typography>
						</Typography>
					</Box>
					<Button
						variant="contained"
						color="primary"
						onClick={openMail}
						sx={{
							width: "100%",
							maxWidth: 400,
						}}
					>
						Open email app
					</Button>
					<Typography sx={{ alignSelf: "center", mt: theme.spacing(6) }}>
						Didn&apos;t receive the email?{" "}
						<Typography
							component="span"
							onClick={resendToken}
							sx={{
								color: theme.palette.primary.main,
								userSelect: "none",
								pointerEvents: disabled ? "none" : "auto",
								cursor: disabled ? "default" : "pointer",
								opacity: disabled ? 0.5 : 1,
							}}
						>
							Click to resend
						</Typography>
					</Typography>
				</Stack>
			</Stack>
			<Box
				textAlign="center"
				p={theme.spacing(12)}
			>
				<Typography display="inline-block">Go back to —</Typography>
				<Typography
					component="span"
					ml={theme.spacing(2)}
					color={theme.palette.primary.main}
					onClick={handleNavigate}
					sx={{ userSelect: "none" }}
				>
					Log In
				</Typography>
			</Box>
		</Stack>
	);
};

export default CheckEmail;
