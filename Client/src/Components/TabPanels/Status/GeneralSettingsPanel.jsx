import { useState, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ConfigBox } from "../../../Pages/Monitors/styled";
import Checkbox from "../../Inputs/Checkbox";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import TabPanel from "@mui/lab/TabPanel";

const GeneralSettingsPanel = () => {
	const theme = useTheme();
	const dispatch = useDispatch();

	//redux state
	const { user, authToken, isLoading } = useSelector((state) => state.auth);

	// Local state for form data, errors, and file handling
	const [localData, setLocalData] = useState({
	});
	const [errors, setErrors] = useState({});
	const [file, setFile] = useState();

	const handleSubmit = () => {};

	const handleChange = () => {};

	const handleBlur = () => {};
	return (
		<TabPanel
			value="general settings"
			sx={{
				"& h1, & p, & input": {
					color: theme.palette.text.tertiary,
				},
			}}
		>
		<Stack
			component="form"
			className="status-general-settings-form"
			onSubmit={handleSubmit}
			noValidate
			spellCheck="false"
			gap={theme.spacing(12)}
			mt={theme.spacing(6)}
		>
			<ConfigBox>
				<Box>
					<Stack gap={theme.spacing(6)}>
						<Typography component="h2">Access</Typography>
						<Typography component="p">
							If your status page is ready, you can mark it as published.
						</Typography>
					</Stack>
				</Box>
				<Checkbox
					id="published-to-public"
					label={`Published and visible to the public`}
					onChange={(e) => handleChange(e)}
					onBlur={handleBlur}
				/>
			</ConfigBox>
		</Stack>
		</TabPanel>		
	);
};

export default GeneralSettingsPanel;
