import { useEffect, useState, useCallback } from "react";
import { networkService } from "../../../../main";
import { useSelector } from "react-redux";
import { createToast } from "../../../../Utils/toastUtils";
import { useTheme } from "@emotion/react";
const getMonitorWithPercentage = (monitor, theme) => {
	let uptimePercentage = "";
	let percentageColor = "";

	if (monitor.uptimePercentage !== undefined) {
		uptimePercentage =
			monitor.uptimePercentage === 0 ? "0" : (monitor.uptimePercentage * 100).toFixed(2);

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
		...monitor,
		percentage: uptimePercentage,
		percentageColor,
	};
};

const useStatusPageFetch = (isCreate = false) => {
	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPage, setStatusPage] = useState(undefined);
	const [monitors, setMonitors] = useState(undefined);
	const { authToken } = useSelector((state) => state.auth);
	const theme = useTheme();

	const fetchStatusPage = useCallback(async () => {
		try {
			const response = await networkService.getStatusPage({ authToken });
			if (!response?.data?.data) return;
			const { statusPage, monitors } = response.data.data;
			setStatusPage(statusPage);

			const monitorsWithPercentage = monitors.map((monitor) =>
				getMonitorWithPercentage(monitor, theme)
			);
			setMonitors(monitorsWithPercentage);
		} catch (error) {
			// If there is a 404, status page is not found
			if (error?.response?.status === 404) {
				setStatusPage(undefined);
				return;
			}
			createToast({ body: error.message });
			setNetworkError(true);
		} finally {
			setIsLoading(false);
		}
	}, [authToken, theme]);

	useEffect(() => {
		if (isCreate === true) {
			return;
		}
		fetchStatusPage();
	}, [isCreate, fetchStatusPage]);

	return [statusPage, monitors, isLoading, networkError, fetchStatusPage];
};

export { useStatusPageFetch };
