import { Stack, Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DataTable from "../../Components/Table";
import Breadcrumbs from "../../Components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import Host from "../Uptime/Home/host";
import useUtils from "../Uptime/utils";
import { StatusLabel } from "../../Components/Label";
import BarChart from "../../Components/Charts/BarChart";
import ActionsMenu from "../Uptime/Home/actionsMenu";
const BREADCRUMBS = [{ name: `Distributed Uptime`, path: "/distributed-uptime" }];

const DistributedUptime = () => {
	const theme = useTheme();
	const { determineState } = useUtils();

	const navigate = useNavigate();
	const headers = [
		{
			id: "name",
			content: <Box>Host</Box>,
			render: (row) => (
				<Host
					key={row.id}
					url={row.host}
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
				const status = determineState(row);
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
			render: (row) => <BarChart checks={row.checks.slice().reverse()} />,
		},
		{
			id: "type",
			content: "Type",
			render: (row) => <span>{"Distributed uptime"}</span>,
		},
		{
			id: "actions",
			content: "Actions",
			render: (row) => (
				<ActionsMenu
					monitor={row}
					isAdmin={true}
				/>
			),
		},
	];

	const data = [
		{
			id: 1,
			host: "www.google.com",
			title: "Google",
			status: true,
			responseTime: 123,
			type: "distributed uptime",
			action: "Action",
			isActive: true,
			percentage: 100,
			percentageColor: theme.palette.percentage.uptimeExcellent,
			checks: [
				{ status: true, responseTime: 80 },
				{ status: false, responseTime: 100 },
				{ status: true, responseTime: 60 },
				{ status: true, responseTime: 40 },
				{ status: true, responseTime: 50 },
				{ status: true, responseTime: 20 },
				{ status: true, responseTime: 10 },
				{ status: true, responseTime: 60 },
			],
		},
	];
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
