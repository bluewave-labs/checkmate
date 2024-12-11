import { useTheme } from "@emotion/react";
import Fallback from "../../Components/Fallback";
import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Status = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	return (
		<Box
			className="status"
			sx={{
				':has(> [class*="fallback__"])': {
					position: "relative",
					border: 1,
					borderColor: theme.palette.border.light,
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
			<Stack
				alignItems="center"
				mt={theme.spacing(10)}
			>
				<Button
					variant="contained"
					color="primary"
					onClick={() => {
						navigate("/status/create");
					}}
					sx={{ fontWeight: 500 }}
				>
					Let's create your status page
				</Button>
			</Stack>
		</Box>
	);
};

export default Status;
