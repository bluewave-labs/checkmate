import { useEffect, useState } from "react";

const useStatusPageFetch = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPage, setStatusPage] = useState(undefined);

	return [statusPage, isLoading, networkError];
};

export { useStatusPageFetch };
