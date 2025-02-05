// Components
import { Stack, Box, Button } from "@mui/material";
import DataTable from "../../Components/Table";
import Breadcrumbs from "../../Components/Breadcrumbs";
import Host from "../Uptime/Home/host";
import BarChart from "../../Components/Charts/BarChart";
import ActionsMenu from "../Uptime/Home/actionsMenu";
import { StatusLabel } from "../../Components/Label";
// Utils
import { networkService } from "../../main";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import useUtils from "../Uptime/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Constants
const BREADCRUMBS = [{ name: `Distributed Uptime`, path: "/distributed-uptime" }];
const TYPE_MAP = {
	distributed_http: "Distributed HTTP",
};

const DistributedUptimeMonitors = () => {
	// Redux state
	const { authToken, user } = useSelector((state) => state.auth);
	// Local state
	const [monitors, setMonitors] = useState([]);
	const [filteredMonitors, setFilteredMonitors] = useState([]);
	const [monitorsSummary, setMonitorsSummary] = useState({});
	// Utils

	const { determineState } = useUtils();
	const theme = useTheme();
	const navigate = useNavigate();
	const headers = [
		{
			id: "name",
			content: <Box>Host</Box>,
			render: (row) => (
				<Host
					key={row._id}
					url={row.url}
					title={row.title}
					percentageColor={row.percentageColor}
					percentage={row.percentage}
				/>
			),
		},
		{
			id: "status",
			content: <Box width="max-content"> Status</Box>,
			render: (row) => {
				const status = determineState(row?.monitor);
				return (
					<StatusLabel
						status={status}
						text={status}
						customStyles={{ textTransform: "capitalize" }}
					/>
				);
			},
		},
		{
			id: "responseTime",
			content: "Response Time",
			render: (row) => <BarChart checks={row?.monitor?.checks.slice().reverse()} />,
		},
		{
			id: "type",
			content: "Type",
			render: (row) => <span>{TYPE_MAP[row.monitor.type]}</span>,
		},
		{
			id: "actions",
			content: "Actions",
			render: (row) => (
				<ActionsMenu
					monitor={row.monitor}
					isAdmin={true}
				/>
			),
		},
	];

	const getMonitorWithPercentage = (monitor, theme) => {
		let uptimePercentage = "";
		let percentageColor = theme.palette.percentage.uptimeExcellent;

		if (monitor.uptimePercentage !== undefined) {
			uptimePercentage =
				monitor.uptimePercentage === 0
					? "0"
					: (monitor.uptimePercentage * 100).toFixed(2);

			percentageColor =
				monitor.uptimePercentage < 0.25
					? theme.palette.percentage.uptimePoor
					: monitor.uptimePercentage < 0.5
						? theme.palette.percentage.uptimeFair
						: monitor.uptimePercentage < 0.75
							? theme.palette.percentage.uptimeGood
							: theme.palette.percentage.uptimeExcellent;
		}

		return {
			id: monitor._id,
			name: monitor.name,
			url: monitor.url,
			title: monitor.name,
			percentage: uptimePercentage,
			percentageColor,
			monitor: monitor,
		};
	};

	useEffect(() => {
		const cleanup = networkService.subscribeToDistributedUptimeMonitors({
			authToken: authToken,
			teamId: user.teamId,
			limit: 25,
			types: ["distributed_http"],
			page: 0,
			rowsPerPage: 10,
			filter: null,
			field: null,
			order: null,
			onUpdate: (data) => {
				const res = data.monitors;
				const { monitors, filteredMonitors, summary } = res;
				const mappedMonitors = filteredMonitors.map((monitor) =>
					getMonitorWithPercentage(monitor, theme)
				);
				setMonitors(monitors);
				setFilteredMonitors(mappedMonitors);
				setMonitorsSummary(summary);
			},
		});

		return cleanup;
	}, [user.teamId, authToken, theme]);

	return (
		<Stack
			direction="column"
			gap={theme.spacing(8)}
		>
			<Breadcrumbs list={BREADCRUMBS} />
			<Stack
				direction="row"
				justifyContent="end"
				alignItems="center"
				mt={theme.spacing(5)}
				gap={theme.spacing(6)}
			>
				<Button
					variant="contained"
					color="primary"
					onClick={() => {
						navigate("/distributed-uptime/create");
					}}
					sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
				>
					Create new
				</Button>
			</Stack>
			{monitors.length > 0 && (
				<DataTable
					headers={headers}
					data={filteredMonitors}
					config={{
						rowSX: {
							cursor: "pointer",
							"&:hover": {
								backgroundColor: theme.palette.background.accent,
							},
						},
						onRowClick: (row) => {
							navigate(`/distributed-uptime/${row.id}`);
						},
					}}
				/>
			)}
		</Stack>
	);
};

export default DistributedUptimeMonitors;
