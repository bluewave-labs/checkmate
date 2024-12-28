import { useTheme } from "@emotion/react";
import Fallback from "../../Components/Fallback";
import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateStatus from "./CreateStatus";
import { useEffect, useState } from "react";
import { networkService } from "../../main";
import { useSelector } from "react-redux";
import { createToast }  from "../../Utils/toastUtils"
import { logger } from "../../Utils/Logger";

const Status = () => {
	const theme = useTheme();
	const navigate = useNavigate();	
	const {authToken} = useSelector((state) => state.auth);
	const {apiBaseUrl} = useSelector((state) => state.settings);	
	const [initForm, setInitForm] = useState({});
	useEffect(() => {
		const getStatusPage = async () => {
			let config = { authToken: authToken, url: "status-page" };
			try {
				let res = await networkService.getStatusPageByUrl(config);			
				if(res && res.data)
					setInitForm( res.data.data)
			}catch (error) {
				createToast({ body: "Failed to fetch status page data" });
				logger.error("Failed to fetch status page", error);
			} 
			
		};
		getStatusPage();
	}, []);

	return (
		<>
			{Object.keys(initForm).length===0? (
				<Box
					className="status"
					sx={{
						':has(> [class*="fallback__"])': {
							position: "relative",
							border: 1,
							borderColor: theme.palette.border.light,
							borderRadius: theme.shape.borderRadius,
							borderStyle: "dashed",
							backgroundColor: theme.palette.background.main,
							overflow: "hidden",
						},
					}}
				>
					<Fallback
						title="status page"
						checks={[
							"Share your uptime publicly",
							"Keep your users informed about incidents",
							"Build trust with your customers",
						]}
					/>
					<Stack
						alignItems="center"
						mt={theme.spacing(10)}
					>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								navigate("/status/create");
							}}
							sx={{ fontWeight: 500 }}
						>
							Let's create your status page
						</Button>
					</Stack>
				</Box>
			) : (
					<CreateStatus initForm={initForm}/>
			 )}
		</>
	);	
};

export default Status;
