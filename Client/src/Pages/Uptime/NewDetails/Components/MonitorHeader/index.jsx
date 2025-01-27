import { Stack, Typography } from "@mui/material";
import PulseDot from "../../../../../Components/Animated/PulseDot";
import Dot from "../../../../../Components/Dot";
import { useTheme } from "@emotion/react";
import useUtils from "../../../Home/Hooks/useUtils";
import { formatDurationRounded } from "../../../../../Utils/timeUtils";
import ConfigButton from "../ConfigButton";

const MonitorHeader = ({ monitor }) => {
	const theme = useTheme();
	const { statusColor, statusMsg, determineState } = useUtils();

	return (
		<Stack
			direction="row"
			justifyContent="space-between"
		>
			<Stack>
				<Typography variant="h1">{monitor.name}</Typography>
				<Stack
					direction="row"
					alignItems={"center"}
					gap={theme.spacing(2)}
				>
					<PulseDot color={statusColor[determineState(monitor)]} />
					<Typography variant="h2">
						{monitor?.url?.replace(/^https?:\/\//, "") || "..."}
					</Typography>
					<Dot />
					<Typography>
						Checking every {formatDurationRounded(monitor?.interval)}.
					</Typography>
				</Stack>
			</Stack>
			<ConfigButton
				shouldRender={true}
				monitorId={monitor._id}
			/>
		</Stack>
	);
};

export default MonitorHeader;
