import { useSelector } from "react-redux";
import { useState } from "react";
import { networkService } from "../../../../main";
import { createToast } from "../../../../Utils/toastUtils";
import { useNavigate } from "react-router-dom";

const useStatusPageDelete = (fetchStatusPage) => {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { authToken } = useSelector((state) => state.auth);

	const deleteStatusPage = async () => {
		try {
			setIsLoading(true);
			await networkService.deleteStatusPage({ authToken });
			setIsLoading(false);
			fetchStatusPage?.();
			return true;
		} catch (error) {
			createToast({
				body: error.message,
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return [deleteStatusPage, isLoading];
};

export { useStatusPageDelete };
