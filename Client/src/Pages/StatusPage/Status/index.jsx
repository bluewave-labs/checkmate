// Components
import { Typography, Stack, Box, Button } from "@mui/material";
import GenericFallback from "../../../Components/GenericFallback";
import Fallback from "../../../Components/Fallback";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StatusPageBarChart from "../../../Components/Charts/StatusPageBarChart";
import Host from "../../Uptime/Monitors/Components/Host";
import { StatusLabel } from "../../../Components/Label";
import SettingsIcon from "../../../assets/icons/settings-bold.svg?react";
import Image from "../../../Components/Image";
import SkeletonLayout from "./Components/Skeleton";

// Utils
import { useState, useEffect } from "react";
import { useStatusPageFetch } from "./Hooks/useStatusPageFetch";
import { useTheme } from "@emotion/react";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import useUtils from "../../Uptime/Monitors/Hooks/useUtils";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStatusPageDelete } from "./Hooks/useStatusPageDelete";

const PublicStatus = () => {
	// Local state
	const [status, setStatus] = useState(undefined);

	// Utils
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const [statusPage, monitors, isLoading, networkError, fetchStatusPage] =
		useStatusPageFetch();
	const [deleteStatusPage, isDeleting] = useStatusPageDelete(fetchStatusPage);

	const { determineState } = useUtils();
	const location = useLocation();
	const navigate = useNavigate();
	// Setup
	const currentPath = location.pathname;
	let sx = { paddingLeft: theme.spacing(20), paddingRight: theme.spacing(20) };
	let AdminLink = undefined;

	// Public status page
	if (currentPath === "/status/public") {
		sx = {
			paddingTop: theme.spacing(20),
			paddingLeft: "20vw",
			paddingRight: "20vw",
		};
		AdminLink = (
			<Box>
				<Typography
					className="forgot-p"
					display="inline-block"
					color={theme.palette.primary.contrastText}
				>
					Administrator?
				</Typography>
				<Typography
					component="span"
					color={theme.palette.accent.main}
					ml={theme.spacing(2)}
					sx={{ cursor: "pointer" }}
					onClick={() => navigate("/login")}
				>
					Login here
				</Typography>
			</Box>
		);
	}

	// Effects
	useEffect(() => {
		if (typeof monitors === "undefined") return;
		const monitorsStatus = {};
		if (monitors.every((monitor) => monitor.status === true)) {
			monitorsStatus.msg = "All systems operational";
			monitorsStatus.color = theme.palette.success.lowContrast;
			monitorsStatus.icon = <CheckCircleIcon />;
		}

		if (monitors.every((monitor) => monitor.status === false)) {
			monitorsStatus.msg = "All systems down";
			monitorsStatus.color = theme.palette.error.lowContrast;
		}

		if (monitors.some((monitor) => monitor.status === false)) {
			monitorsStatus.msg = "Degraded performance";
			monitorsStatus.color = theme.palette.warning.lowContrast;
		}

		// Paused or unknown
		if (monitors.some((monitor) => typeof monitor.status === "undefined")) {
			monitorsStatus.msg = "Unknown status";
			monitorsStatus.color = theme.palette.warning.lowContrast;
		}
		setStatus(monitorsStatus);
	}, [monitors, theme]);

	if (isLoading) {
		return <SkeletonLayout />;
	}

	if (networkError === true) {
		return (
			<GenericFallback>
				<Typography
					variant="h1"
					marginY={theme.spacing(4)}
					color={theme.palette.primary.contrastTextTertiary}
				>
					Network error
				</Typography>
				<Typography>Please check your connection</Typography>
			</GenericFallback>
		);
	}

	if (!isLoading && typeof status === "undefined" && currentPath === "/status/public") {
		return (
			<Stack sx={sx}>
				<GenericFallback>
					<Typography
						variant="h1"
						marginY={theme.spacing(4)}
						color={theme.palette.primary.contrastTextTertiary}
					>
						A public status page is not set up.
					</Typography>
					<Typography>Please contact to your administrator</Typography>
				</GenericFallback>
			</Stack>
		);
	}

	if (!isLoading && typeof statusPage === "undefined") {
		return (
			<Fallback
				title="status page"
				checks={[
					"Display a list of monitors to track",
					"Share your monitors with the public",
				]}
				link="/status/create"
				isAdmin={isAdmin}
			/>
		);
	}

	if (!isLoading && statusPage.isPublic === false) {
		return (
			<Stack sx={sx}>
				<GenericFallback>
					<Typography
						variant="h1"
						marginY={theme.spacing(4)}
						color={theme.palette.primary.contrastTextTertiary}
					>
						This status page is not public.
					</Typography>
					<Typography>Please contact to your administrator</Typography>
				</GenericFallback>
			</Stack>
		);
	}

	return (
		<Stack
			gap={theme.spacing(10)}
			alignItems="center"
			sx={sx}
		>
			<Stack
				alignSelf="flex-start"
				direction="row"
				width="100%"
				gap={theme.spacing(2)}
				justifyContent="space-between"
				alignItems="flex-end"
			>
				<Stack
					direction="row"
					gap={theme.spacing(8)}
					alignItems="flex-end"
				>
					<Image
						src={
							statusPage?.logo?.data
								? `data:image/png;base64,${statusPage?.logo?.data}`
								: undefined
						}
						alt={"Company logo"}
						maxWidth={"100px"}
					/>
					<Typography variant="h2">{statusPage?.companyName}</Typography>
				</Stack>
				<Stack
					direction="row"
					gap={theme.spacing(2)}
				>
					<Box>
						<Button
							variant="contained"
							color="error"
							onClick={deleteStatusPage}
							loading={isDeleting}
						>
							Delete
						</Button>
					</Box>
					<Box>
						<Button
							variant="contained"
							color="secondary"
							onClick={() => navigate(`/status/create`)}
							sx={{
								px: theme.spacing(5),
								"& svg": {
									mr: theme.spacing(3),
									"& path": {
										stroke: theme.palette.secondary.contrastText,
									},
								},
							}}
						>
							<SettingsIcon /> Configure
						</Button>
					</Box>
				</Stack>
			</Stack>
			<Typography variant="h2">Service status</Typography>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="center"
				gap={theme.spacing(2)}
				height={theme.spacing(30)}
				width={"100%"}
				backgroundColor={status?.color}
				borderRadius={theme.spacing(2)}
			>
				{status?.icon}
				<Typography>{status?.msg}</Typography>
			</Stack>
			{monitors?.map((monitor) => {
				const status = determineState(monitor);
				return (
					<Stack
						key={monitor._id}
						width="100%"
						gap={theme.spacing(2)}
					>
						<Host
							key={monitor._id}
							url={monitor.url}
							title={monitor.title}
							percentageColor={monitor.percentageColor}
							percentage={monitor.percentage}
						/>
						<Stack
							direction="row"
							alignItems="center"
							gap={theme.spacing(20)}
						>
							<StatusPageBarChart checks={monitor.checks.slice().reverse()} />
							<Box>
								<StatusLabel
									status={status}
									text={status}
									customStyles={{ textTransform: "capitalize" }}
								/>
							</Box>
						</Stack>
					</Stack>
				);
			})}
			{AdminLink}
		</Stack>
	);
};

export default PublicStatus;
