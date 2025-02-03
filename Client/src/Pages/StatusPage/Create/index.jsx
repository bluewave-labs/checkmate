// Components
import { Stack, Tab, Button } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import Settings from "./Components/Tabs/Settings";
import Content from "./Components/Tabs/Content";

//Utils
import { useTheme } from "@emotion/react";
import { useState, useRef } from "react";
import { publicPageSettingsValidation } from "../../../Validation/validation";
import { buildErrors } from "../../../Validation/error";

//Constants
const TAB_LIST = ["General settings", "Contents"];

const CreateStatusPage = () => {
	//Redux state

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
	});
	const [errors, setErrors] = useState({});

	// Refs
	const intervalRef = useRef(null);

	//Utils
	const theme = useTheme();

	// Handlers
	const handleFormChange = (e) => {
		let { type, name, value, checked } = e.target;

		// Handle errors
		const { error } = publicPageSettingsValidation.validate(
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

	const handleSubmit = () => {
		let toSubmit = {
			...form,
			logo: { type: form.logo?.type ?? null, size: form.logo?.size ?? null },
		};
		const { error } = publicPageSettingsValidation.validate(toSubmit, {
			abortEarly: false,
		});
		console.log(error);
		setErrors((prev) => {
			return buildErrors(prev, name, error);
		});
	};

	return (
		<Stack gap={theme.spacing(10)}>
			<TabContext value={TAB_LIST[tab]}>
				<TabList
					onChange={(_, tab) => {
						setTab(TAB_LIST.indexOf(tab));
					}}
				>
					{TAB_LIST.map((tab, idx) => (
						<Tab
							key={Math.random()}
							label={TAB_LIST[idx]}
							value={TAB_LIST[idx]}
						/>
					))}
				</TabList>
				{tab === 0 ? (
					<Settings
						tabValue={TAB_LIST[0]}
						form={form}
						handleFormChange={handleFormChange}
						handleImageChange={handleImageChange}
						progress={progress}
						removeLogo={removeLogo}
						errors={errors}
					/>
				) : (
					<Content
						tabValue={TAB_LIST[1]}
						form={form}
						handleFormChange={handleFormChange}
					/>
				)}
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
		</Stack>
	);
};

export default CreateStatusPage;
