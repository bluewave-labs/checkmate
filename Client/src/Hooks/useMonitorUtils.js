import { useCallback } from "react";

const useMonitorUtils = () => {
	const getMonitorWithPercentage = useCallback((monitor, theme) => {
		let uptimePercentage = "";
		let percentageColor = "";

		if (monitor.uptimePercentage !== undefined) {
			uptimePercentage =
				monitor.uptimePercentage === 0
					? "0"
					: (monitor.uptimePercentage * 100).toFixed(2);

			percentageColor =
				monitor.uptimePercentage < 0.25
					? theme.palette.error.main
					: monitor.uptimePercentage < 0.5
						? theme.palette.warning.main
						: monitor.uptimePercentage < 0.75
							? theme.palette.success.main
							: theme.palette.success.main;
		}

		return {
			id: monitor._id,
			name: monitor.name,
			url: monitor.url,
			title: monitor.name,
			percentage: uptimePercentage,
			percentageColor,
			monitor: monitor,
		};
	}, []);

	const determineState = useCallback((monitor) => {
		if (typeof monitor === "undefined") return "pending";
		if (monitor.isActive === false) return "paused";
		if (monitor?.status === undefined) return "pending";
		return monitor?.status == true ? "up" : "down";
	}, []);

	return { getMonitorWithPercentage, determineState };
};

export { useMonitorUtils };
