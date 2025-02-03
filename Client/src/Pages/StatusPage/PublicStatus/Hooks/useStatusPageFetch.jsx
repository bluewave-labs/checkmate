import { useEffect, useState } from "react";
import { networkService } from "../../../../main";
import { useSelector } from "react-redux";
import { createToast } from "../../../../Utils/toastUtils";

const useStatusPageFetch = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPage, setStatusPage] = useState(undefined);
	const { authToken } = useSelector((state) => state.auth);

	useEffect(() => {
		const fetchStatusPage = async () => {
			try {
				const res = await networkService.getStatusPage({ authToken });
				setStatusPage(res.data.data);
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
		};
		fetchStatusPage();
	}, [authToken]);

	return [statusPage, isLoading, networkError];
};

export { useStatusPageFetch };
