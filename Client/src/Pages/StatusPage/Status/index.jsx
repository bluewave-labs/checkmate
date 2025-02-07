// Components
import { Typography, Stack } from "@mui/material";
import GenericFallback from "../../../Components/GenericFallback";
import Fallback from "../../../Components/Fallback";
import AdminLink from "./Components/AdminLink";
import ControlsHeader from "./Components/ControlsHeader";
import SkeletonLayout from "./Components/Skeleton";
import StatusBar from "./Components/StatusBar";
import MonitorsList from "./Components/MonitorsList";
import Dialog from "../../../Components/Dialog";

// Utils
import { useStatusPageFetch } from "./Hooks/useStatusPageFetch";
import { useTheme } from "@emotion/react";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useLocation } from "react-router-dom";
import { useStatusPageDelete } from "./Hooks/useStatusPageDelete";
import { useState } from "react";

const PublicStatus = () => {
	// Local state
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	// Utils
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const [statusPage, monitors, isLoading, networkError, fetchStatusPage] =
		useStatusPageFetch();
	const [deleteStatusPage, isDeleting] = useStatusPageDelete(fetchStatusPage);
	const location = useLocation();

	// Setup
	const currentPath = location.pathname;
	let sx = { paddingLeft: theme.spacing(20), paddingRight: theme.spacing(20) };
	let link = undefined;

	// Public status page
	if (currentPath === "/status/public") {
		sx = {
			paddingTop: theme.spacing(20),
			paddingLeft: "20vw",
			paddingRight: "20vw",
		};
		link = <AdminLink />;
	}

	// Loading
	if (isLoading) {
		return <SkeletonLayout />;
	}

	// Error fetching data
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

	// Public status page fallback
	if (
		!isLoading &&
		typeof statusPage === "undefined" &&
		currentPath === "/status/public"
	) {
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

	// Finished loading, but status page is not public
	if (
		!isLoading &&
		currentPath === "/status/public" &&
		statusPage.isPublished === false
	) {
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

	// Status page doesn't exist
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

	return (
		<Stack
			gap={theme.spacing(10)}
			alignItems="center"
			sx={{ ...sx, position: "relative" }}
		>
			<ControlsHeader
				statusPage={statusPage}
				isDeleting={isDeleting}
				isDeleteOpen={isDeleteOpen}
				setIsDeleteOpen={setIsDeleteOpen}
			/>
			<Typography variant="h2">Service status</Typography>
			<StatusBar monitors={monitors} />
			<MonitorsList monitors={monitors} />
			{link}
			<Dialog
				title="Do you want to delete this status page?"
				onConfirm={() => {
					deleteStatusPage();
					setIsDeleteOpen(false);
				}}
				onCancel={() => {
					setIsDeleteOpen(false);
				}}
				open={isDeleteOpen}
				confirmationButtonLabel="Yes, delete status page"
				description="Once deleted, your status page cannot be retrieved."
				isLoading={isDeleting || isLoading}
			/>
		</Stack>
	);
};

export default PublicStatus;
