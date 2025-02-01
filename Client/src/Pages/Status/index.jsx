import { useTheme } from "@emotion/react";
import Fallback from "../../Components/Fallback";
import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateStatus from "./CreateStatus";
import { useEffect, useState } from "react";
import { networkService } from "../../main";
import { useSelector } from "react-redux";
import { logger } from "../../Utils/Logger";

/**
 * The configuration page for public page that contains a general settings and 
 * content tabs, It will display a static page if there is no status page configured
 * or the status page if one is already configured
 */
const Status = () => {
	const theme = useTheme();
	const navigate = useNavigate();	
	const {authToken} = useSelector((state) => state.auth);
	const [initForm, setInitForm] = useState({});
	const STATUS_PAGE = import.meta.env.VITE_STATU_PAGE_URL?? "status-page";					
	useEffect(() => {
		const getStatusPage = async () => {
			let config = { authToken: authToken, url: STATUS_PAGE };
			try {
				let res = await networkService.getStatusPageByUrl(config);			
				if(res && res.data)
					setInitForm( res.data.data)
			}catch (error) {
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
							borderColor: theme.palette.primary.lowContrast,
							borderRadius: theme.shape.borderRadius,
							borderStyle: "dashed",
  					        backgroundColor: theme.palette.primary.main,
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
							color="accent"
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
