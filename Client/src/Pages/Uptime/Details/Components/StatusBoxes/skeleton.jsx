import { Stack, Skeleton } from "@mui/material";
import { useTheme } from "@emotion/react";
const SkeletonLayout = () => {
	const theme = useTheme();
	return (
		<Stack
			direction="row"
			gap={theme.spacing(4)}
			mt={theme.spacing(4)}
		>
			<Skeleton
				variant="rounded"
				width="33%"
				height={50}
			/>
			<Skeleton
				variant="rounded"
				width="33%"
				height={50}
			/>
			<Skeleton
				variant="rounded"
				width="33%"
				height={50}
			/>
		</Stack>
	);
};

export default SkeletonLayout;
