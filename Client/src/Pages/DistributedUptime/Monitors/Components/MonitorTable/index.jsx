import DataTable from "../../../../../Components/Table";
import BarChart from "../../../../../Components/Charts/BarChart";
import { Box } from "@mui/material";
import { StatusLabel } from "../../../../../Components/Label";

//REFACTOR
import Host from "../../../../Uptime/Monitors/Components/Host";
import ActionsMenu from "../../../../Uptime/Monitors/Components/ActionsMenu";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useMonitorUtils } from "../../../../../Hooks/useMonitorUtils";
const TYPE_MAP = {
	distributed_http: "Distributed HTTP",
};

const MonitorTable = ({ isLoading, monitors }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { determineState } = useMonitorUtils();

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

	return (
		<DataTable
			shouldRender={!isLoading}
			headers={headers}
			data={monitors}
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
	);
};

export default MonitorTable;
