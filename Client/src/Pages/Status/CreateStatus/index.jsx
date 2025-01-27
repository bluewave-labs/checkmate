import PropTypes from "prop-types";
import { useState } from "react";
import { Box, Tab, useTheme, Stack, Button } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useSelector } from "react-redux";

import GeneralSettingsPanel from "../../../Components/TabPanels/Status/GeneralSettingsPanel";
import ContentPanel from "../../../Components/TabPanels/Status/ContentPanel";
import { publicPageSettingsValidation } from "../../../Validation/validation";
import { hasValidationErrors } from "../../../Validation/error";
import { StatusFormProvider } from "../CreateStatusContext";
import { formatBytes } from "../../../Utils/fileUtils";
import { createToast } from "../../../Utils/toastUtils";
import { networkService } from "../../../main";
import { buildErrors } from "../../../Validation/error";

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
		const STATUS_PAGE = import.meta.env.VITE_STATU_PAGE_URL?? "status-page";
		const [form, setForm] = useState(
			hasInitForm
				? initForm
				: {
						companyName: "",
						url: "/"+STATUS_PAGE,
						timezone: "America/Toronto",
						color: "#4169E1",
						//which fields matching below?
						publish: false,
						logo: null,
						monitors: [],
						showUptimePercentage: false,
						showBarcode: false,
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
			if (
				hasValidationErrors(localData, publicPageSettingsValidation, setErrors)
			) {
				setActiveTabOnErrors();
				return;
			}

			localData.logo = form.logo
			localData.url = STATUS_PAGE
			let config = { authToken: authToken, url: STATUS_PAGE, data: localData };
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

		const handleChange = (event) => {
			event.preventDefault();
			const { value, id, name } = event.target;
			setForm((prev) => ({
				...prev,
				[id ?? name]: value
			}));
		};

		const handelCheckboxChange = (e) => {			
			const { id } = e.target;
			
			setForm((prev) => {
				return ({
				...prev,
				[id ]: !prev[id]
			})});
		}
	
		const handleBlur = (event) => {
			event.preventDefault();
			const { value, id } = event.target;
			const { error } = publicPageSettingsValidation.validate(
				{ [id]: value },
				{
					abortEarly: false,
				}
			);
			setErrors((prev) => {
				return buildErrors(prev, id, error);
			});
		};		

		return (
			<Box
				className="status"
				px={theme.spacing(20)}
				py={theme.spacing(12)}
				backgroundColor={theme.palette.primary.main}
				border={1}
				borderColor={theme.palette.primary.lowContrast}
				borderRadius={theme.shape.borderRadius}
			>
				<TabContext value={tabList[tabIdx]}>
					<Box
						sx={{
							borderBottom: 1,
							borderColor: theme.palette.primary.lowContrast,
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
										color: theme.palette.tertiary.contrastText,
										backgroundColor: theme.palette.tertiary.main,
										textTransform: "none",
										minWidth: "fit-content",
										paddingY: theme.spacing(6),
										fontWeight: 400,
										borderBottom: "2px solid transparent",
										borderRight: `1px solid ${theme.palette.primary.lowContrast}`,
										"&:first-child": { borderTopLeftRadius: "8px" },
										"&:last-child": { borderTopRightRadius: "8px", borderRight: 0 },
										"&:focus-visible": {
											color: theme.palette.primary.contrastText,
											borderColor: theme.palette.tertiary.contrastText,
											borderRightColor: theme.palette.primary.lowContrast,
										},
										"&.Mui-selected": {
											backgroundColor: theme.palette.secondary.main,
											color: theme.palette.secondary.contrastText,
											borderColor: theme.palette.secondary.contrastText,
											borderRightColor: theme.palette.primary.lowContrast,
										},
										"&:hover": {
											borderColor: theme.palette.primary.lowContrast,
										}
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
						handleBlur={handleBlur}
						handleChange={handleChange}
						handelCheckboxChange={handelCheckboxChange}
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
						color="accent"
						onClick={handleSubmit}
					>
						Save
					</Button>
				</Stack>
			</Box>
		);
	};

CreateStatus.propTypes = {
	initForm: PropTypes.object
};

export default CreateStatus;
