// Components
import { Box, Stack, Typography, Button } from "@mui/material";
import Image from "../../../../../Components/Image";
import SettingsIcon from "../../../../../assets/icons/settings-bold.svg?react";

//Utils
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const Controls = ({ deleteStatusPage, isDeleting }) => {
	const theme = useTheme();
	const location = useLocation();
	const currentPath = location.pathname;
	const navigate = useNavigate();
	if (currentPath === "/status/public") {
		return null;
	}

	return (
		<Stack
			direction="row"
			gap={theme.spacing(2)}
		>
			<Box>
				<Button
					variant="contained"
					color="error"
					onClick={deleteStatusPage}
					loading={isDeleting}
				>
					Delete
				</Button>
			</Box>
			<Box>
				<Button
					variant="contained"
					color="secondary"
					onClick={() => navigate(`/status/configure`)}
					sx={{
						px: theme.spacing(5),
						"& svg": {
							mr: theme.spacing(3),
							"& path": {
								stroke: theme.palette.secondary.contrastText,
							},
						},
					}}
				>
					<SettingsIcon /> Configure
				</Button>
			</Box>
		</Stack>
	);
};

Controls.propTypes = {
	deleteStatusPage: PropTypes.func,
	isDeleting: PropTypes.bool,
};

const ControlsHeader = ({ statusPage, deleteStatusPage, isDeleting }) => {
	const theme = useTheme();

	return (
		<Stack
			alignSelf="flex-start"
			direction="row"
			width="100%"
			gap={theme.spacing(2)}
			justifyContent="space-between"
			alignItems="flex-end"
		>
			<Stack
				direction="row"
				gap={theme.spacing(8)}
				alignItems="flex-end"
			>
				<Image
					shouldRender={statusPage?.logo?.data ? true : false}
					alt={"Company logo"}
					maxWidth={"100px"}
					base64={statusPage?.logo?.data}
				/>
				<Typography variant="h2">{statusPage?.companyName}</Typography>
			</Stack>
			<Controls
				deleteStatusPage={deleteStatusPage}
				isDeleting={isDeleting}
			/>
		</Stack>
	);
};

ControlsHeader.propTypes = {
	statusPage: PropTypes.object,
	deleteStatusPage: PropTypes.func,
	isDeleting: PropTypes.bool,
};

export default ControlsHeader;
