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

	/* 
	TODO 
	This is used on 
	1) Details > Gradient card */
	/* These are rediections. We should do something that maps up to success, down to error, and get the theme by that
	See Client\src\Components\Label\index.jsx
	*/

	const statusToTheme = {
		up: "success",
		down: "error",
		paused: "warning",
		pending: "secondary",
		"cannot resolve": "tertiary",
	};

	const getStatusStyles = (status) => {
		const themeColor = statusToTheme[status];

		return {
			backgroundColor: theme.palette[themeColor].lowContrast,
			background: `linear-gradient(340deg, ${theme.palette[themeColor].main} -60%, ${theme.palette[themeColor].lowContrast} 35%)`,
			borderColor: theme.palette[themeColor].lowContrast,
			"& h2": {
				color: theme.palette[themeColor].contrastText,
				textTransform: "uppercase",
			},
			"& p": {
				color: theme.palette[themeColor].contrastText,
			},
		};
	};

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

	return {
		determineState,
		statusColor,
		statusMsg,
		pagespeedStatusMsg,
		statusStyles,
		statusToTheme,
		getStatusStyles,
	};
};

export default useUtils;
