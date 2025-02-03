import { Stack, Skeleton } from "@mui/material";

const SkeletonLayout = () => {
	return (
		<Stack>
			<Skeleton
				variant="rectangular"
				height={"80vh"}
			/>
		</Stack>
	);
};

export default SkeletonLayout;
