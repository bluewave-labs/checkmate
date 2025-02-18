import { useState, useEffect } from "react";
import { networkService } from "../../../../main";
import { createToast } from "../../../../Utils/toastUtils";
import { useSelector } from "react-redux";

const useStatusPageFetchByUrl = ({ url }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPage, setStatusPage] = useState(undefined);
	const [monitorId, setMonitorId] = useState(undefined);
	const [isPublished, setIsPublished] = useState(false);
	useEffect(() => {
		const fetchStatusPageByUrl = async () => {
			try {
				const response = await networkService.getStatusPageByUrl({
					url,
					type: "distributed",
				});
				if (!response?.data?.data) return;
				const statusPage = response.data.data;
				setStatusPage(statusPage);
				setMonitorId(statusPage?.monitors[0]);
				setIsPublished(statusPage?.isPublished);
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
	}, [url]);

	return [isLoading, networkError, statusPage, monitorId, isPublished];
};

export { useStatusPageFetchByUrl };
