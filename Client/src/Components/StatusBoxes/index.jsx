// Components
import { Stack } from "@mui/material";
import SkeletonLayout from "./skeleton";
// Utils
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
const StatusBoxes = ({ shouldRender, children }) => {
	const theme = useTheme();
	if (!shouldRender) {
		return <SkeletonLayout numBoxes={children?.length ?? 1} />;
	}

	return (
		<Stack
			direction="row"
			gap={theme.spacing(8)}
		>
			{children}
		</Stack>
	);
};

StatusBoxes.propTypes = {
	shouldRender: PropTypes.bool,
	children: PropTypes.node,
};

export default StatusBoxes;
