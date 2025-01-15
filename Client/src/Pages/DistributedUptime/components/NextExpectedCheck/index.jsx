import { Box, LinearProgress, Stack } from "@mui/material";
import { useState, useEffect } from "react";

const NextExpectedCheck = ({ lastUpdateTime, interval, trigger }) => {
	const [elapsedMs, setElapsedMs] = useState(lastUpdateTime);

	useEffect(() => {
		setElapsedMs(lastUpdateTime);
		const timer = setInterval(() => {
			setElapsedMs((prev) => prev + 10);
		}, 10);
		return () => clearInterval(timer);
	}, [interval, trigger]);

	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
		>
			<Box sx={{ width: "100%" }}>
				<LinearProgress
					variant="determinate"
					value={(elapsedMs / interval) * 100}
				/>
			</Box>
		</Stack>
	);
};

export default NextExpectedCheck;
