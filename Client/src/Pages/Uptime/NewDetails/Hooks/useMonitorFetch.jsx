import { useEffect, useState } from "react";
import { networkService } from "../../../../main";
import { logger } from "../../../../Utils/Logger";
import { useNavigate } from "react-router-dom";

export const useMonitorFetch = ({ authToken, monitorId, dateRange }) => {
	const [monitorIsLoading, setMonitorsIsLoading] = useState(false);
	const [monitor, setMonitor] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				setMonitorsIsLoading(true);
				const res = await networkService.getUptimeDetailsById({
					authToken: authToken,
					monitorId: monitorId,
					dateRange: dateRange,
					normalize: true,
				});
				setMonitor(res?.data?.data ?? {});
			} catch (error) {
				logger.error(error);
				navigate("/not-found", { replace: true });
			} finally {
				setMonitorsIsLoading(false);
			}
		};
		fetchMonitors();
	}, [authToken, dateRange, monitorId, navigate]);
	return { monitor, monitorIsLoading };
};

export default useMonitorFetch;
