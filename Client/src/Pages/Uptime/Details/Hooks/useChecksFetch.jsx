import { useState } from "react";
import { useEffect } from "react";
import { logger } from "../../../../Utils/Logger";
import { networkService } from "../../../../main";

export const useChecksFetch = ({
	authToken,
	monitorId,
	dateRange,
	page,
	rowsPerPage,
}) => {
	const [checks, setChecks] = useState(undefined);
	const [checksCount, setChecksCount] = useState(undefined);
	const [checksAreLoading, setChecksAreLoading] = useState(false);

	useEffect(() => {
		const fetchChecks = async () => {
			try {
				setChecksAreLoading(true);
				const res = await networkService.getChecksByMonitor({
					authToken: authToken,
					monitorId: monitorId,
					sortOrder: "desc",
					limit: null,
					dateRange: dateRange,
					filter: null,
					page: page,
					rowsPerPage: rowsPerPage,
				});
				setChecks(res.data.data.checks);
				setChecksCount(res.data.data.checksCount);
			} catch (error) {
				logger.error(error);
			} finally {
				setChecksAreLoading(false);
			}
		};
		fetchChecks();
	}, [authToken, monitorId, dateRange, page, rowsPerPage]);

	return { checks, checksCount, checksAreLoading };
};

export default useChecksFetch;
