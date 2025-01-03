import { Box, Button, Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { getPageSpeedByTeamId } from "../../Features/PageSpeedMonitor/pageSpeedMonitorSlice";
import Fallback from "../../Components/Fallback";
import "./index.css";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import Breadcrumbs from "../../Components/Breadcrumbs";
import SkeletonLayout from "./skeleton";
import Card from "./card";
import { networkService } from "../../main";
import { Heading } from "../../Components/Heading";
import { useIsAdmin } from "../../Hooks/useIsAdmin";
const PageSpeed = () => {
	const theme = useTheme();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const isAdmin = useIsAdmin();
	const { user, authToken } = useSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(true);
	const [monitors, setMonitors] = useState([]);
	const [monitorCount, setMonitorCount] = useState(0);
	useEffect(() => {
		dispatch(getPageSpeedByTeamId(authToken));
	}, [authToken, dispatch]);

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				setIsLoading(true);
				const res = await networkService.getMonitorsByTeamId({
					authToken: authToken,
					teamId: user.teamId,
					limit: 10,
					types: ["pagespeed"],
					status: null,
					checkOrder: "desc",
					normalize: true,
					page: null,
					rowsPerPage: null,
					filter: null,
					field: null,
					order: null,
				});
				if (res?.data?.data?.monitors) {
					setMonitors(res.data.data.monitors);
					setMonitorCount(res.data.data.monitorCount);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMonitors();
	}, [authToken, user.teamId]);

	// will show skeletons only on initial load
	// since monitor state is being added to redux persist, there's no reason to display skeletons on every render
	let isActuallyLoading = isLoading && monitors?.length === 0;
	return (
		<Box
			className="page-speed"
			sx={{
				':has(> [class*="fallback__"])': {
					position: "relative",
					border: 1,
					borderColor: theme.palette.border.light,
					borderRadius: theme.shape.borderRadius,
					borderStyle: "dashed",
					backgroundColor: theme.palette.background.main,
					overflow: "hidden",
				},
			}}
		>
			{isActuallyLoading ? (
				<SkeletonLayout />
			) : monitors?.length !== 0 ? (
				<Stack gap={theme.spacing(8)}>
					<Box>
						<Breadcrumbs list={[{ name: `pagespeed`, path: "/pagespeed" }]} />
						<Stack
							direction="row"
							justifyContent="end"
							alignItems="center"
							mt={theme.spacing(5)}
						>
							{isAdmin && (
								<Button
									variant="contained"
									color="primary"
									onClick={() => navigate("/pagespeed/create")}
									sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
								>
									Create new
								</Button>
							)}
						</Stack>
					</Box>
					<Stack
						direction="row"
						sx={{
							alignItems: "center",
							gap: ".25rem",
							flexWrap: "wrap",
						}}
					>
						<Heading component="h2">PageSpeed monitors</Heading>
						{/* TODO Correct the class current-monitors-counter, there are some unnecessary things there	 */}
						<Box
							component="span"
							className="current-monitors-counter"
							color={theme.palette.text.primary}
							border={1}
							borderColor={theme.palette.border.light}
							backgroundColor={theme.palette.background.accent}
						>
							{monitorCount}
						</Box>
					</Stack>
					<Grid
						container
						spacing={theme.spacing(12)}
					>
						{monitors?.map((monitor) => (
							<Card
								monitor={monitor}
								key={monitor._id}
							/>
						))}
					</Grid>
				</Stack>
			) : (
				<Fallback
					title="pagespeed monitor"
					checks={[
						"Report on the user experience of a page",
						"Help analyze webpage speed",
						"Give suggestions on how the page can be improved",
					]}
					link="/pagespeed/create"
					isAdmin={isAdmin}
				/>
			)}
		</Box>
	);
};
PageSpeed.propTypes = {
	isAdmin: PropTypes.bool,
};

export default PageSpeed;
