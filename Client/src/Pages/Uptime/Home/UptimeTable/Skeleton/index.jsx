import { Skeleton } from "@mui/material";
import DataTable from "../../../../../Components/Table";
const ROWS_NUMBER = 7;
const ROWS_ARRAY = Array.from({ length: ROWS_NUMBER }, (_, i) => i);

const TableSkeleton = () => {
	/* TODO Skeleton does not follow light and dark theme */

	const headers = [
		{
			id: "name",

			content: "Host",

			render: () => <Skeleton />,
		},
		{
			id: "status",
			content: "Status",
			render: () => <Skeleton />,
		},
		{
			id: "responseTime",
			content: "Response Time",
			render: () => <Skeleton />,
		},
		{
			id: "type",
			content: "Type",
			render: () => <Skeleton />,
		},
		{
			id: "actions",
			content: "Actions",
			render: () => <Skeleton />,
		},
	];

	return (
		<DataTable
			headers={headers}
			data={ROWS_ARRAY}
		/>
	);
};

export { TableSkeleton };
