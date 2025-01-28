import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ButtonGroup, Stack, Typography, Button } from "@mui/material";
import { useParams } from "react-router-dom";

import { networkService } from "../../main";
import { useTheme } from "@emotion/react";
import Select from "../../Components/Inputs/Select";
import IncidentTable from "./IncidentTable";
import SkeletonLayout from "./skeleton";

const Incidents = () => {
	const theme = useTheme();
	const authState = useSelector((state) => state.auth);
	const { monitorId } = useParams();

	const [monitors, setMonitors] = useState({});
	const [selectedMonitor, setSelectedMonitor] = useState("0");
	const [isLoading, setIsLoading] = useState(true);

	// TODO do something with these filters
	const [filter, setFilter] = useState("all");
	const [dateRange, setDateRange] = useState("hour");

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				setIsLoading(true);
				const res = await networkService.getMonitorsByTeamId({
					authToken: authState.authToken,
					teamId: authState.user.teamId,
					limit: null,
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
	}, [authState, monitorId]);

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
						justifyContent="space-between"
						gap={theme.spacing(6)}
					>
						<Stack
							direction="row"
							alignItems="center"
							gap={theme.spacing(6)}
						>
							<Typography
								display="inline-block"
								component="h1"
								color={theme.palette.primary.contrastTextSecondary}
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
									backgroundColor: theme.palette.primary.main,
									color: theme.palette.primary.contrastTextSecondary,
								}}
							/>
						</Stack>
						<Stack
							direction="row"
							alignItems="center"
							gap={theme.spacing(6)}
						>
							<Typography
								display="inline-block"
								component="h1"
								color={theme.palette.primary.contrastTextSecondary}
							>
								Filter by:
							</Typography>
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
									Cannot resolve
								</Button>
							</ButtonGroup>
						</Stack>
						<Stack
							direction="row"
							alignItems="center"
							gap={theme.spacing(6)}
						>
							<Typography
								display="inline-block"
								component="h1"
								color={theme.palette.primary.contrastTextSecondary}
							>
								Show:
							</Typography>
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
									filled={(dateRange === "hour").toString()}
									onClick={() => setDateRange("hour")}
								>
									Last hour
								</Button>
								<Button
									variant="group"
									filled={(dateRange === "day").toString()}
									onClick={() => setDateRange("day")}
								>
									Last day
								</Button>
								<Button
									variant="group"
									filled={(dateRange === "week").toString()}
									onClick={() => setDateRange("week")}
								>
									Last week
								</Button>
								<Button
									variant="group"
									filled={(dateRange === "all").toString()}
									onClick={() => setDateRange("all")}
								>
									All
								</Button>
							</ButtonGroup>
						</Stack>
					</Stack>
					<IncidentTable
						monitors={monitors}
						selectedMonitor={selectedMonitor}
						filter={filter}
						dateRange={dateRange}
					/>
				</>
			)}
		</Stack>
	);
};

export default Incidents;
