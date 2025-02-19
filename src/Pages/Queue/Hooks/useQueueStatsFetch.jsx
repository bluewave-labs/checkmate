import { useState, useCallback } from "react";
import { networkService } from "../../../main";

const useQueueStatsFetch = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [queueMetrics, setQueueMetrics] = useState(undefined);
	const [networkError, setNetworkError] = useState(false);

	const fetchQueueMetrics = useCallback(async () => {
		try {
			setIsLoading(true);
			const res = await networkService.getQueueMetrics();
			const metrics = res?.data?.data;
			if (!metrics) {
				throw new Error();
			}

			setQueueMetrics(metrics);
		} catch (error) {
			setNetworkError(true);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return [isLoading, networkError, fetchQueueMetrics, queueMetrics];
};

export { useQueueStatsFetch };
