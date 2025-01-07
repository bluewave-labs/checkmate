import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DataTable from "../../Components/Table";
import Breadcrumbs from "../../Components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
const BREADCRUMBS = [{ name: `Distributed Uptime`, path: "/distributed-uptime" }];

const DistributedUptime = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const headers = [
		{ id: "host", content: "Host", render: (row) => row.host },
		{ id: "status", content: "Status", render: (row) => row.status },
		{
			id: "responseTime",
			content: "Response Time",
			render: (row) => `${row.responseTime} ms`,
		},
		{ id: "type", content: "Type", render: (row) => row.type },
		{ id: "action", content: "Action", render: (row) => row.action },
	];
	const data = [
		{
			id: 1,
			host: "www.google.com",
			status: "up",
			responseTime: 123,
			type: "distributed uptime",
			action: "Action",
		},
	];
	return (
		<Stack
			direction="column"
			gap={theme.spacing(8)}
		>
			<Breadcrumbs list={BREADCRUMBS} />
			<DataTable
				headers={headers}
				data={data}
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
		</Stack>
	);
};

export default DistributedUptime;
