// Components
import { Typography, Stack } from "@mui/material";
import GenericFallback from "../../../Components/GenericFallback";
import Fallback from "../../../Components/Fallback";
// Utils
import { useStatusPageFetch } from "./Hooks/useStatusPageFetch";
import { useTheme } from "@emotion/react";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";

const PublicStatus = () => {
	// Utils
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const [statusPage, isLoading, networkError] = useStatusPageFetch();

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

	return <Stack gap={theme.spacing(10)}>Content Here</Stack>;
};

export default PublicStatus;
