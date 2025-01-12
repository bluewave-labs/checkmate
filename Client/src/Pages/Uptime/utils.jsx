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
		up: theme.palette.success.lowContrast,
		down: theme.palette.error.lowContrast,
		paused: theme.palette.warning.lowContrast,
		pending: theme.palette.warning.lowContrast,
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
	/* These are rediections. We should do something that maps up to success, down to error, and get the theme by that
	
	*/
	const statusStyles = {
		up: {
			backgroundColor: theme.palette.success.lowContrast,
			background: `linear-gradient(340deg, ${theme.palette.success.lowContrast} -60%, ${theme.palette.success.contrastText} 35%)`,
			borderColor: theme.palette.success.contrastText,
			"& h2": { color: theme.palette.success.main },
		},
		down: {
			backgroundColor: theme.palette.error.lowContrast,
			background: `linear-gradient(340deg, ${theme.palette.error.lowContrast} -60%, ${theme.palette.error.contrastText} 35%)`,
			borderColor: theme.palette.error.contrastText,
			"& h2": { color: theme.palette.error.main },
		},
		paused: {
			backgroundColor: theme.palette.warning.lowContrast,
			background: `linear-gradient(340deg, ${theme.palette.warning.lowContrast} -60%, ${theme.palette.warning.contrastText} 35%)`,
			borderColor: theme.palette.warning.contrastText,
			"& h2": { color: theme.palette.warning.main },
		},
		pending: {
			backgroundColor: theme.palette.warning.lowContrast,
			background: `linear-gradient(340deg, ${theme.palette.warning.lowContrast} -60%, ${theme.palette.warning.contrastText} 35%)`,
			borderColor: theme.palette.warning.contrastText,
			"& h2": { color: theme.palette.warning.main },
		},
	};

	/* These are rediections. We should do something that maps up to success, down to error, and get the theme by that
	
	*/
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
