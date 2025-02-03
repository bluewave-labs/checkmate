import { useState } from "react";
import { networkService } from "../../../../main";
import { useSelector } from "react-redux";
import { createToast } from "../../../../Utils/toastUtils";

const useCreateStatusPage = () => {
	const { authToken, user } = useSelector((state) => state.auth);

	const [isLoading, setIsLoading] = useState(false);
	const [networkError, setNetworkError] = useState(false);

	const createStatusPage = async ({ form }) => {
		try {
			await networkService.createStatusPage({ authToken, user, form });
			return true;
		} catch (error) {
			setNetworkError(true);
			createToast({ body: error?.response?.data?.msg ?? error.message });
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return [createStatusPage, isLoading, networkError];
};

export { useCreateStatusPage };
