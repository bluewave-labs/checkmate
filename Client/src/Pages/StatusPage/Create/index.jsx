// Components
import { Stack, Button, Typography } from "@mui/material";
import Tabs from "./Components/Tabs";
import GenericFallback from "../../../Components/GenericFallback";
import SkeletonLayout from "./Components/Skeleton";
//Utils
import { useTheme } from "@emotion/react";
import { useState, useRef } from "react";
import { statusPageValidation } from "../../../Validation/validation";
import { buildErrors } from "../../../Validation/error";
import { useSelector } from "react-redux";
import { useMonitorsFetch } from "./Hooks/useMonitorsFetch";
import { useCreateStatusPage } from "./Hooks/useCreateStatusPage";
import { createToast } from "../../../Utils/toastUtils";

//Constants
const TAB_LIST = ["General settings", "Contents"];

const ERROR_TAB_MAPPING = [
	["companyName", "url", "timezone", "color", "isPublished", "logo"],
	["monitors", "showUptimePercentage", "showCharts"],
];

const CreateStatusPage = () => {
	//Redux state
	const { authToken, user } = useSelector((state) => state.auth);
	//Local state
	const [tab, setTab] = useState(0);
	const [progress, setProgress] = useState({ value: 0, isLoading: false });
	const [form, setForm] = useState({
		isPublished: false,
		companyName: "",
		url: "/status/public",
		logo: null,
		timezone: "America/Toronto",
		color: "#4169E1",
		monitors: [],
		showCharts: true,
		showUptimePercentage: true,
	});
	const [errors, setErrors] = useState({});
	const [selectedMonitors, setSelectedMonitors] = useState([]);

	// Refs
	const intervalRef = useRef(null);

	//Utils
	const theme = useTheme();
	const [monitors, isLoading, networkError] = useMonitorsFetch();
	const [createStatusPage, createSatusIsLoading, createStatusPageNetworkError] =
		useCreateStatusPage();

	// Handlers
	const handleFormChange = (e) => {
		let { type, name, value, checked } = e.target;
		// Handle errors
		const { error } = statusPageValidation.validate(
			{ [name]: value },
			{ abortEarly: false }
		);
		setErrors((prev) => {
			return buildErrors(prev, name, error);
		});

		//Handle checkbox
		if (type === "checkbox") {
			setForm((prev) => ({
				...prev,
				[name]: checked,
			}));
			return;
		}

		// Handle other inputs
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageChange = (event) => {
		const img = event.target?.files?.[0];
		const newLogo = {
			src: URL.createObjectURL(img),
			name: img.name,
			type: img.type,
			size: img.size,
		};
		setForm((prev) => ({
			...prev,
			logo: newLogo,
		}));
		intervalRef.current = setInterval(() => {
			const buffer = 12;
			setProgress((prev) => {
				if (prev.value + buffer >= 100) {
					clearInterval(intervalRef.current);
					return { value: 100, isLoading: false };
				}
				return { ...prev, value: prev.value + buffer };
			});
		}, 120);
	};

	const removeLogo = () => {
		setForm((prev) => ({
			...prev,
			logo: undefined,
		}));
		// interrupt interval if image upload is canceled prior to completing the process
		clearInterval(intervalRef.current);
		setProgress({ value: 0, isLoading: false });
	};

	const handleSubmit = async () => {
		let toSubmit = {
			...form,
			logo: { type: form.logo?.type ?? null, size: form.logo?.size ?? null },
		};
		const { error } = statusPageValidation.validate(toSubmit, {
			abortEarly: false,
		});

		if (typeof error === "undefined") {
			const success = await createStatusPage({ form });
			if (success) {
				createToast({ body: "Status page created successfully" });
			}
			return;
		}

		const newErrors = {};
		error?.details?.forEach((err) => {
			newErrors[err.path[0]] = err.message;
		});
		setErrors((prev) => ({ ...prev, ...newErrors }));

		const errorTabs = Object.keys(newErrors).map((err) => {
			return ERROR_TAB_MAPPING.findIndex((tab) => tab.includes(err));
		});

		// If there's an error in the current tab, don't change the tab
		if (errorTabs.some((errorTab) => errorTab === tab)) {
			return;
		}
		// Otherwise go to tab with error
		setTab(errorTabs[0]);
	};

	if (networkError === true) {
		return (
			<GenericFallback>
				<Typography
					variant="h1"
					marginY={theme.spacing(4)}
					color={theme.palette.primary.contrastTextTertiary}
				>
					Network error
				</Typography>
				<Typography>Please check your connection</Typography>
			</GenericFallback>
		);
	}

	if (isLoading) return <SkeletonLayout />;

	return (
		<Stack gap={theme.spacing(10)}>
			<Tabs
				form={form}
				errors={errors}
				monitors={monitors}
				selectedMonitors={selectedMonitors}
				setSelectedMonitors={setSelectedMonitors}
				handleFormChange={handleFormChange}
				handleImageChange={handleImageChange}
				progress={progress}
				removeLogo={removeLogo}
				tab={tab}
				setTab={setTab}
				TAB_LIST={TAB_LIST}
			/>
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
		</Stack>
	);
};

export default CreateStatusPage;
