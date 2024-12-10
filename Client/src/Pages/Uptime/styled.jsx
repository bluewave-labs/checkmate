import { Stack, styled } from "@mui/material";

export const ConfigBox = styled(Stack)(({ theme }) => ({
	flexDirection: "row",
	border: 1,
	borderStyle: "solid",
	borderColor: theme.palette.border.light,
	borderRadius: theme.spacing(2),
	backgroundColor: theme.palette.background.main,
	"& > *": {
		paddingTop: theme.spacing(12),
		paddingBottom: theme.spacing(18),
	},
	"& > div:first-of-type": {
		flex: 0.7,
		borderRight: 1,
		borderRightStyle: "solid",
		borderRightColor: theme.palette.border.light,
		paddingRight: theme.spacing(15),
		paddingLeft: theme.spacing(15),
	},
	"& > div:last-of-type": {
		flex: 1,
		paddingRight: theme.spacing(20),
		paddingLeft: theme.spacing(18),
	},
	"& h2": {
		color: theme.palette.text.secondary,
		fontSize: 15,
		fontWeight: 600,
	},
	"& h3, & p": {
		color: theme.palette.text.tertiary,
	},
	"& p": {
		fontSize: 13,
	},
}));
