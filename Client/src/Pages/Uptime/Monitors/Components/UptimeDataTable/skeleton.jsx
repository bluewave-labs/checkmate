import { Skeleton } from "@mui/material";
import PropTypes from "prop-types";

const UptimeDataTableSkeleton = ({ shouldRender }) => {
	if (!shouldRender) return null;

	return (
		<Skeleton
			variant="rounded"
			width="100%"
			height="100%"
			flex={1}
		/>
	);
};

UptimeDataTableSkeleton.propTypes = {
	shouldRender: PropTypes.bool.isRequired,
};

export default UptimeDataTableSkeleton;
