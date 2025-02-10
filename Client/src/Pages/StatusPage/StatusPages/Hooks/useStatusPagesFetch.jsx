import { useState, useEffect } from "react";
import { networkService } from "../../../../main";
import { useSelector } from "react-redux";
import { createToast } from "../../../../Utils/toastUtils";

const useStatusPagesFetch = () => {
	const { authToken, user } = useSelector((state) => state.auth);

	const [isLoading, setIsLoading] = useState(true);
	const [networkError, setNetworkError] = useState(false);
	const [statusPages, setStatusPages] = useState(undefined);

	useEffect(() => {
		try {
			networkService
				.getStatusPagesByTeamId({ authToken, teamId: user.teamId })
				.then((res) => {
					setStatusPages(res.data.data);
				});
		} catch (error) {
			setNetworkError(true);
			createToast(error.message, "error");
		} finally {
			setIsLoading(false);
		}
	}, [authToken, user]);
	return [isLoading, networkError, statusPages];
};

export { useStatusPagesFetch };
