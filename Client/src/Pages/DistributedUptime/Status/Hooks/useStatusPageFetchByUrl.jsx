import { useState, useEffect } from "react";
import { networkService } from "../../../../main";
import { createToast } from "../../../../Utils/toastUtils";
import { useSelector } from "react-redux";

const useStatusPageFetchByUrl = ({ url }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPage, setStatusPage] = useState(undefined);
	const [monitorId, setMonitorId] = useState(undefined);
	const { authToken } = useSelector((state) => state.auth);
	useEffect(() => {
		const fetchStatusPageByUrl = async () => {
			try {
				const response = await networkService.getStatusPageByUrl({ authToken, url });
				if (!response?.data?.data) return;
				const statusPage = response.data.data;
				setStatusPage(statusPage);
				setMonitorId(statusPage?.monitors[0]);
			} catch (error) {
				setNetworkError(true);
				createToast({
					body: error.message,
				});
			} finally {
				setIsLoading(false);
			}
		};
		fetchStatusPageByUrl();
	}, [authToken, url]);

	return [isLoading, networkError, statusPage, monitorId];
};

export { useStatusPageFetchByUrl };
