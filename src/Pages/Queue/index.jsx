// Components
import { Stack, Typography, Box, Button } from "@mui/material";
import ConfigBox from "../../Components/ConfigBox";
// Utils
import { useTheme } from "@emotion/react";
import { useEffect } from "react";
import { useQueueStatsFetch } from "./Hooks/useQueueStatsFetch";
const QueueUtils = () => {
	const theme = useTheme();
	const [isLoading, networkError, fetchQueueMetrics, queueMetrics] = useQueueStatsFetch();
	console.log(queueMetrics);
	return (
		<Stack gap={theme.spacing(10)}>
			<ConfigBox>
				<Box>
					<Typography component="h1">Get queue stats</Typography>
					<Typography sx={{ mt: theme.spacing(2), mb: theme.spacing(2) }}>
						Get vital stats about the Job Queues
					</Typography>
				</Box>
				<Stack gap={theme.spacing(20)}>
					<Box>
						<Button
							variant="contained"
							color="accent"
							onClick={fetchQueueMetrics}
						>
							Get stats
						</Button>
					</Box>
				</Stack>
			</ConfigBox>
			<Stack></Stack>
			<ConfigBox>
				<Box>
					<Typography component="h1">Flush queue</Typography>
					<Typography sx={{ mt: theme.spacing(2), mb: theme.spacing(2) }}>
						If your queue is stuck for some reason, flush it here and it will restart
					</Typography>
				</Box>
				<Stack gap={theme.spacing(20)}>
					<Box>
						<Button
							variant="contained"
							color="error"
						>
							Flush queue
						</Button>
					</Box>
				</Stack>
			</ConfigBox>
		</Stack>
	);
};

export default QueueUtils;
