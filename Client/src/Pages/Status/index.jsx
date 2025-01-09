import { Box } from "@mui/material";
import { useTheme } from "@emotion/react";
import Fallback from "../../Components/Fallback";

const Status = () => {
	const theme = useTheme();

	return (
		<Box
			className="status"
			sx={{
				':has(> [class*="fallback__"])': {
					position: "relative",
					border: 1,
					borderColor: theme.palette.primary.lowContrast,
					borderRadius: theme.shape.borderRadius,
					borderStyle: "dashed",
					backgroundColor: theme.palette.background.main,
					overflow: "hidden",
				},
			}}
		>
			<Fallback
				title="status page"
				checks={[
					"Share your uptime publicly",
					"Keep your users informed about incidents",
					"Build trust with your customers",
				]}
			/>
		</Box>
	);
};

export default Status;
