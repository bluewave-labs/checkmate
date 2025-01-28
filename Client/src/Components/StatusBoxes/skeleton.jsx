import { Stack, Skeleton } from "@mui/material";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
const SkeletonLayout = ({ numBoxes }) => {
	const theme = useTheme();
	return (
		<Stack
			direction="row"
			gap={theme.spacing(4)}
			mt={theme.spacing(4)}
		>
			{Array.from({ length: numBoxes }).map((_, index) => {
				const width = `${100 / numBoxes}%`;
				return (
					<Skeleton
						variant="rounded"
						width={width}
						height={50}
						key={index}
					/>
				);
			})}
		</Stack>
	);
};

SkeletonLayout.propTypes = {
	numBoxes: PropTypes.number,
};

export default SkeletonLayout;
