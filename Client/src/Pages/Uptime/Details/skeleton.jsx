import { Box, Skeleton, Stack, useTheme } from "@mui/material";

/**
 * Renders a skeleton layout.
 *
 * @returns {JSX.Element}
 */
const SkeletonLayout = () => {
	const theme = useTheme();

	return (
		<>
			<Skeleton
				variant="rounded"
				width="20%"
				height={34}
			/>
			<Stack
				gap={theme.spacing(20)}
				mt={theme.spacing(6)}
			>
				<Stack
					direction="row"
					gap={theme.spacing(4)}
					mt={theme.spacing(4)}
				>
					<Skeleton
						variant="circular"
						style={{ minWidth: 24, minHeight: 24 }}
					/>
					<Box width="80%">
						<Skeleton
							variant="rounded"
							width="50%"
							height={24}
						/>
						<Skeleton
							variant="rounded"
							width="50%"
							height={18}
							sx={{ mt: theme.spacing(4) }}
						/>
					</Box>
					<Skeleton
						variant="rounded"
						width="20%"
						height={34}
						sx={{ alignSelf: "flex-end" }}
					/>
				</Stack>
				<Stack
					direction="row"
					justifyContent="space-between"
					gap={theme.spacing(12)}
				>
					<Skeleton
						variant="rounded"
						width="100%"
						height={80}
					/>
					<Skeleton
						variant="rounded"
						width="100%"
						height={80}
					/>
					<Skeleton
						variant="rounded"
						width="100%"
						height={80}
					/>
				</Stack>
				<Box>
					<Stack
						direction="row"
						justifyContent="space-between"
						mb={theme.spacing(8)}
					>
						<Skeleton
							variant="rounded"
							width="20%"
							height={24}
							sx={{ alignSelf: "flex-end" }}
						/>
						<Skeleton
							variant="rounded"
							width="20%"
							height={34}
						/>
					</Stack>
					<Box sx={{ height: "200px" }}>
						<Skeleton
							variant="rounded"
							width="100%"
							height="100%"
						/>
					</Box>
				</Box>
				<Stack gap={theme.spacing(8)}>
					<Skeleton
						variant="rounded"
						width="20%"
						height={24}
					/>
					<Skeleton
						variant="rounded"
						width="100%"
						height={200}
					/>
					<Skeleton
						variant="rounded"
						width="100%"
						height={50}
					/>
				</Stack>
			</Stack>
		</>
	);
};

export default SkeletonLayout;
