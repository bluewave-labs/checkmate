import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ButtonGroup, Stack, Typography, Button } from "@mui/material";
import { useParams } from "react-router-dom";

import { networkService } from "../../main";
import { useTheme } from "@emotion/react";
import Select from "../../Components/Inputs/Select";
import IncidentTable from "./IncidentTable";
import SkeletonLayout from "./skeleton";
import "./index.css";

const Incidents = () => {
	const theme = useTheme();
	const authState = useSelector((state) => state.auth);
	const { monitorId } = useParams();

	const [monitors, setMonitors] = useState({});
	const [selectedMonitor, setSelectedMonitor] = useState("0");
	const [isLoading, setIsLoading] = useState(true);

	// TODO do something with these filters
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				setIsLoading(true);
				const res = await networkService.getMonitorsByTeamId({
					authToken: authState.authToken,
					teamId: authState.user.teamId,
					limit: -1,
					types: null,
					status: null,
					checkOrder: null,
					normalize: null,
					page: null,
					rowsPerPage: null,
					filter: null,
					field: null,
					order: null,
				});
				// Reduce to a lookup object for 0(1) lookup
				if (res?.data?.data?.monitors?.length > 0) {
					const monitorLookup = res.data.data.monitors.reduce((acc, monitor) => {
						acc[monitor._id] = monitor;
						return acc;
					}, {});
					setMonitors(monitorLookup);
					monitorId !== undefined && setSelectedMonitor(monitorId);
				}
			} catch (error) {
				console.info(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMonitors();
	}, [authState]);

	useEffect(() => {}, [monitors]);

	const handleSelect = (event) => {
		setSelectedMonitor(event.target.value);
	};

	const isActuallyLoading = isLoading && Object.keys(monitors)?.length === 0;

	return (
		<Stack
			className="incidents"
			pt={theme.spacing(6)}
			gap={theme.spacing(12)}
		>
			{isActuallyLoading ? (
				<SkeletonLayout />
			) : (
				<>
					<Stack
						direction="row"
						alignItems="center"
						gap={theme.spacing(6)}
					>
						<Typography
							display="inline-block"
							component="h1"
							color={theme.palette.primary.contrastText.secondary}
						>
							Incidents for
						</Typography>
						<Select
							id="incidents-select-monitor"
							placeholder="All servers"
							value={selectedMonitor}
							onChange={handleSelect}
							items={Object.values(monitors)}
							sx={{
								backgroundColor: theme.palette.background.main,
							}}
						/>
						<ButtonGroup
							sx={{
								ml: "auto",
								"& .MuiButtonBase-root, & .MuiButtonBase-root:hover": {
									borderColor: theme.palette.primary.lowContrast,
								},
							}}
						>
							<Button
								variant="group"
								filled={(filter === "all").toString()}
								onClick={() => setFilter("all")}
							>
								All
							</Button>
							<Button
								variant="group"
								filled={(filter === "down").toString()}
								onClick={() => setFilter("down")}
							>
								Down
							</Button>
							<Button
								variant="group"
								filled={(filter === "resolve").toString()}
								onClick={() => setFilter("resolve")}
							>
								Cannot Resolve
							</Button>
						</ButtonGroup>
					</Stack>
					<IncidentTable
						monitors={monitors}
						selectedMonitor={selectedMonitor}
						filter={filter}
					/>
				</>
			)}
		</Stack>
	);
};

export default Incidents;
