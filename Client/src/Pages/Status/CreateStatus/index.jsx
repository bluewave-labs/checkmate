import PropTypes from "prop-types";
import { useState } from "react";
import { Box, Tab, useTheme, Stack, Button } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import GeneralSettingsPanel from "../../../Components/TabPanels/Status/GeneralSettingsPanel";
import ContentPanel from "../../../Components/TabPanels/Status/ContentPanel";
import { publicPageGeneralSettingsValidation } from "../../../Validation/validation";
import { hasValidationErrors } from "../../../Validation/error";
import { StatusFormProvider } from "../CreateStatusContext";
import { formatBytes } from "../../../Utils/fileUtils";
import { useSelector } from "react-redux";
import { createToast } from "../../../Utils/toastUtils";
import { networkService } from "../../../main";

/**
 * CreateStatus page renders a page with tabs for general settings and contents.
 * @param {object} [props.initForm] - Specifies the initial form value if the status page exists
 * @returns {JSX.Element}
 */

	const CreateStatus = ({ initForm }) => {
		const theme = useTheme();
		const mode = useSelector((state) => state.ui.mode);
		const { authToken } = useSelector((state) => state.auth);
		const [tabIdx, setTabIdx] = useState(0);
		const [errors, setErrors] = useState({});
		const error_tab_maping = [
			["companyName", "url", "timezone", "color", "publish", "logo"],
			["monitors", "showUptimePercentage", "showBarcode"],
		];
		const tabList = ["General settings", "Contents"];
		const hasInitForm = initForm && Object.keys(initForm).length > 0;
		const [form, setForm] = useState(
			hasInitForm
				? initForm
				: {
						companyName: "",
						url: "",
						timezone: "America/Toronto",
						color: "#4169E1",
						//which fields matching below?
						//publish: false,
						logo: null,
						monitors: [],
						// showUptimePercentage: false,
						// showBarcode: false,
					}
		);
		const setActiveTabOnErrors = () => {
			let newIdx = -1;
			Object.keys(errors).map((id) => {
				if (newIdx !== -1) return;
				error_tab_maping.map((val, idx) => {
					let anyMatch = val.some((vl) => vl == id);
					if (anyMatch) {
						newIdx = idx;
						return;
					}
				});
			});
			if (newIdx !== -1) setTabIdx(newIdx);
		};

		const handleTabChange = (_, newTab) => {
			setTabIdx(tabList.indexOf(newTab));
		};

		const handleSubmit = async (e) => {
			e.preventDefault();
			let localData = {
				...form,
				monitors:
					form.monitors[0] && Object.keys(form.monitors[0]).includes("_id")
						? form.monitors.map((m) => m._id)
						: form.monitors,
				theme: mode,
				logo: { type: form.logo?.type ?? "", size: form.logo?.size ?? "" },
			};
			//delete localData.logo
			if (
				hasValidationErrors(localData, publicPageGeneralSettingsValidation, setErrors)
			) {
				setActiveTabOnErrors();
				return;
			}

			//form.logo = { ...logo, size: formatBytes(logo?.size) };
			let config = { authToken: authToken, url: "status-page", data: localData };
			try {
				const res = await networkService.createStatusPage(config);
				if (!res.status === 200) {
					throw new Error("Failed to create status page");
				}
				createToast({ body: "Status page created successfully!" });
			} catch (e) {
				createToast({ body: e.message || "Error creating status page" });
			}
		};

		return (
			<Stack
				className="status"
				px={theme.spacing(20)}
				py={theme.spacing(12)}
				gap={theme.spacing(12)}
				border={1}
				borderColor={theme.palette.border.light}
				borderRadius={theme.shape.borderRadius}
				backgroundColor={theme.palette.background.main}
			>
				<TabContext value={tabList[tabIdx]}>
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
					<StatusFormProvider
						form={form}
						setForm={setForm}
						errors={errors}
						setErrors={setErrors}
					>
						{tabIdx == 0 ? <GeneralSettingsPanel /> : <ContentPanel />}
					</StatusFormProvider>
				</TabContext>
				<Stack
					direction="row"
					justifyContent="flex-end"
				>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSubmit}
					>
						Save
					</Button>
				</Stack>
			</Stack>
		);
	};

CreateStatus.propTypes = {
	initForm: PropTypes.object
};

export default CreateStatus;
