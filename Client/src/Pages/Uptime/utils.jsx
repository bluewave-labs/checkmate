import { useTheme } from "@mui/material";

const useUtils = () => {
	const determineState = (monitor) => {
		if (monitor.isActive === false) return "paused";
		if (monitor?.status === undefined) return "pending";
		return monitor?.status == true ? "up" : "down";
	};

	/* TODO Refactor: from here on shouldn't live in a custom hook, but on theme, or constants  */
	const theme = useTheme();

	const statusColor = {
		up: theme.palette.success.accent,
		down: theme.palette.error.accent,
		paused: theme.palette.warning.accent,
		pending: theme.palette.warning.accent,
	};

	const statusMsg = {
		up: "Your site is up.",
		down: "Your site is down.",
		paused: "Pending...",
	};

	const pagespeedStatusMsg = {
		up: "Live (collecting data)",
		down: "Inactive",
		paused: "Paused",
	};

	/* This is used on 
	1) Details > Gradient card */
	const statusStyles = {
		up: {
			backgroundColor: theme.palette.success.accent,
			background: `linear-gradient(340deg, ${theme.palette.success.accent} -60%, ${theme.palette.success.contrastText} 35%)`,
			borderColor: theme.palette.success.contrastText,
			"& h2": { color: theme.palette.success.main },
		},
		down: {
			backgroundColor: theme.palette.error.accent /* dark */,
			background: `linear-gradient(340deg, ${theme.palette.error.accent} -60%, ${theme.palette.error.contrastText} 35%)`,
			borderColor: theme.palette.error.contrastText,
			"& h2": { color: theme.palette.error.main },
		},
		paused: {
			backgroundColor: theme.palette.warning.accent /* dark */,
			background: `linear-gradient(340deg, ${theme.palette.warning.accent} -60%, ${theme.palette.warning.contrastText} 35%)`,
			borderColor: theme.palette.warning.contrastText,
			"& h2": { color: theme.palette.warning.main },
		},
		pending: {
			backgroundColor: theme.palette.warning.accent /* dark */,
			background: `linear-gradient(340deg, ${theme.palette.warning.accent} -60%, ${theme.palette.warning.contrastText} 35%)`,
			borderColor: theme.palette.warning.contrastText,
			"& h2": { color: theme.palette.warning.main },
		},
	};
	const pagespeedStyles = {
		up: {
			bg: theme.palette.success.dark,
			light: theme.palette.success.light,
			stroke: theme.palette.success.main,
		},
		down: {
			bg: theme.palette.error.dark,
			light: theme.palette.error.light,
			stroke: theme.palette.error.main,
		},
		paused: {
			bg: theme.palette.warning.dark,
			light: theme.palette.warning.light,
			stroke: theme.palette.warning.main,
		},
		pending: {
			bg: theme.palette.warning.dark,
			light: theme.palette.warning.light,
			stroke: theme.palette.warning.main,
		},
	};

	return {
		determineState,
		statusColor,
		statusMsg,
		pagespeedStatusMsg,
		pagespeedStyles,
		statusStyles,
	};
};

export default useUtils;
