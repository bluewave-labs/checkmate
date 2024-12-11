import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Box, Tab, useTheme } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import GeneralSettingsPanel from "../../../Components/TabPanels/Status/GeneralSettingsPanel";
import {
	capitalizeFirstLetter,
	toLowerCaseFirstLetter,
} from "../../../Utils/stringUtils";
import ContentPanel from "../../../Components/TabPanels/Status/ContentPanel";

/**
 * CreateStatus page renders a page with tabs for general settings and contents.
 * @param {string} [props.open] - Specifies the initially open tab: 'general settings' or 'content'.
 * @returns {JSX.Element}
 */

const CreateStatus = ({ open = "general-settings" }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	let tabList = ["General Settings", "Contents"];
	const tab = open
		.split("-")
		.map((a) => capitalizeFirstLetter(a))
		.join(" ");

	const [tabIdx, setTabIdx] = useState(tabList.indexOf(tab));

	const handleTabChange = (event, newTab) => {
		let toNavString = newTab.split(" ").map((a) => toLowerCaseFirstLetter(a));
		setTabIdx(tabList.indexOf(newTab));
		toNavString = toNavString.join("-");
		navigate(`/status/${toNavString}`);
	};

	useEffect(() => {
		setTabIdx(tabList.indexOf(tab));
	}, [tab]);

	return (
		<Box
			className="status"
			px={theme.spacing(20)}
			py={theme.spacing(12)}
			border={1}
			borderColor={theme.palette.border.light}
			borderRadius={theme.shape.borderRadius}
			backgroundColor={theme.palette.background.main}
		>
			<TabContext value={tab}>
				<Box
					sx={{
						borderBottom: 1,
						borderColor: theme.palette.border.light,
						"& .MuiTabs-root": { height: "fit-content", minHeight: "0" },
					}}
				>
					<TabList
						onChange={handleTabChange}
						aria-label="status tabs"
					>
						{tabList.map((label, index) => (
							<Tab
								label={label}
								key={index}
								value={label}
								sx={{
									fontSize: 13,
									color: theme.palette.text.tertiary,
									textTransform: "none",
									minWidth: "fit-content",
									minHeight: 0,
									paddingLeft: 0,
									paddingY: theme.spacing(4),
									fontWeight: 400,
									marginRight: theme.spacing(8),
									"&:focus": {
										outline: "none",
									},
								}}
							/>
						))}
					</TabList>
				</Box>
				{tabIdx == 0 ? <GeneralSettingsPanel /> : <ContentPanel />}
			</TabContext>
		</Box>
	);
};

CreateStatus.propTypes = {
	open: PropTypes.oneOf(["general-settings", "contents"]),
};

export default CreateStatus;
