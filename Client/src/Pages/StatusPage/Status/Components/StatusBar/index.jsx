// Components
import { Stack, Typography } from "@mui/material";

// Utils
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
const StatusBar = ({ status }) => {
	const theme = useTheme();
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			gap={theme.spacing(2)}
			height={theme.spacing(30)}
			width={"100%"}
			backgroundColor={status?.color}
			borderRadius={theme.spacing(2)}
		>
			{status?.icon}
			{/* CAIO_REVIEW */}
			<Typography variant="h2DarkBg">{status?.msg}</Typography>
		</Stack>
	);
};

export default StatusBar;

StatusBar.propTypes = {
	status: PropTypes.object.isRequired,
};
