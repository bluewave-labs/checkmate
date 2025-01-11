import { Stack, styled } from "@mui/material";

export const ChartBox = styled(Stack)(({ theme }) => ({
	flex: "1 30%",
	gap: theme.spacing(8),
	height: 300,
	minWidth: 250,
	padding: theme.spacing(8),
	border: 1,
	borderStyle: "solid",
	borderColor: theme.palette.primary.lowContrast,
	borderRadius: 4,
	backgroundColor: theme.palette.primary.main,
	"& h2": {
		color: theme.palette.primary.contrastText.secondary,
		fontSize: 15,
		fontWeight: 500,
	},
	"& .MuiBox-root:not(.area-tooltip) p": {
		color: theme.palette.primary.contrastText.tertiary,
		fontSize: 13,
	},
	"& .MuiBox-root > span": {
		color: theme.palette.primary.contrastText.main,
		fontSize: 20,
		"& span": {
			opacity: 0.8,
			marginLeft: 2,
			fontSize: 15,
		},
	},
	"& .MuiStack-root": {
		flexDirection: "row",
		gap: theme.spacing(6),
	},
	"& .MuiStack-root:first-of-type": {
		alignItems: "center",
	},
	"& tspan, & text": {
		fill: theme.palette.primary.contrastText.tertiary,
	},
	"& path": {
		transition: "fill 300ms ease, stroke-width 400ms ease",
	},
}));
