import { useEffect, useState } from "react";
import { networkService } from "../../../../main";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../../../Utils/toastUtils";

export const useReportFetch = ({ authToken, monitorId, dateRange }) => {
	const [reportNetworkError, setReportNetworkError] = useState(false);
	const [reportIsLoading, setReportIsLoading] = useState(true);
	const [reportData, setReportData] = useState(undefined);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				const res = await networkService.getStatsByMonitorId({
					authToken: authToken,
					monitorId: monitorId,
					dateRange: dateRange,
					normalize: true,
				});
				setReportData(res?.data?.data ?? {});
			} catch (error) {
				setReportNetworkError(true);
				createToast({ body: error.message });
			} finally {
				setReportIsLoading(false);
			}
		};
		fetchMonitors();
	}, [authToken, dateRange, monitorId, navigate]);
	return [reportData, reportIsLoading, reportNetworkError];
};

export default useReportFetch;
