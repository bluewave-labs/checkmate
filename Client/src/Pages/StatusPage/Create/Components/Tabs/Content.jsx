import { Stack, Typography } from "@mui/material";
import { TabPanel } from "@mui/lab";

const Content = ({ tabValue }) => {
	return (
		<TabPanel value={tabValue}>
			<Stack>
				<Typography>Content</Typography>
			</Stack>
		</TabPanel>
	);
};

export default Content;
