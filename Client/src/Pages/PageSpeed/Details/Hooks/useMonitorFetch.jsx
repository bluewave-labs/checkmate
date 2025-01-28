import { useEffect, useState } from "react";
import { networkService } from "../../../../main";
import { logger } from "../../../../Utils/Logger";
import { useNavigate } from "react-router-dom";
const useMonitorFetch = ({ authToken, monitorId }) => {
	const navigate = useNavigate();

	const [monitor, setMonitor] = useState(undefined);
	const [audits, setAudits] = useState(undefined);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		const fetchMonitor = async () => {
			try {
				setIsLoading(true);
				const res = await networkService.getStatsByMonitorId({
					authToken: authToken,
					monitorId: monitorId,
					sortOrder: "desc",
					limit: 50,
					dateRange: "day",
					numToDisplay: null,
					normalize: null,
				});
				setMonitor(res?.data?.data ?? undefined);
				setAudits(res?.data?.data?.checks?.[0]?.audits ?? undefined);
			} catch (error) {
				logger.error(logger);
				navigate("/not-found", { replace: true });
			} finally {
				setIsLoading(false);
			}
		};

		fetchMonitor();
	}, [authToken, monitorId, navigate]);

	return { monitor, audits, isLoading };
};

export { useMonitorFetch };
