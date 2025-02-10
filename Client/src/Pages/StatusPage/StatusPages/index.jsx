// Components
import { Stack, Typography } from "@mui/material";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import Fallback from "../../../Components/Fallback";
import GenericFallback from "../../../Components/GenericFallback";
// Utils
import { useTheme } from "@emotion/react";
import { useStatusPagesFetch } from "./Hooks/useStatusPagesFetch";
import { useIsAdmin } from "../../../Hooks/useIsAdmin";
import { useNavigate } from "react-router";
const BREADCRUMBS = [{ name: `Status Pages`, path: "/distributed-uptime/status-pages" }];

const StatusPages = () => {
	// Utils
	const theme = useTheme();
	const isAdmin = useIsAdmin();
	const [isLoading, networkError, statusPages] = useStatusPagesFetch();
	const navigate = useNavigate();

	// Handlers
	const handleStatusPageClick = (statusPage) => {
		if (statusPage.type === "distributed") {
			navigate(`/status/distributed/${statusPage.url}`);
		} else if (statusPage.type === "uptime") {
			navigate(`/status/uptime/${statusPage.url}`);
		}
	};

	if (!isLoading && typeof statusPages === "undefined") {
		return (
			<Fallback
				title="status page"
				checks={[
					"Display a list of monitors to track",
					"Share your monitors with the public",
				]}
				link="/status/uptime/create"
				isAdmin={isAdmin}
			/>
		);
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
	return (
		<Stack gap={theme.spacing(10)}>
			<Breadcrumbs list={BREADCRUMBS} />
			{statusPages?.map((statusPage) => {
				return (
					<Stack
						key={statusPage._id}
						onClick={() => handleStatusPageClick(statusPage)}
						sx={{ cursor: "pointer" }}
					>
						<Typography variant="h2">Company Name: {statusPage.companyName}</Typography>
						<Typography variant="h2">Status page URL: {statusPage.url}</Typography>
						<Typography variant="h2">Type: {statusPage.type}</Typography>
					</Stack>
				);
			})}
		</Stack>
	);
};

export default StatusPages;
