// Components
import { Stack, Typography, Button, Box } from "@mui/material";
import ConfigBox from "../../../Components/ConfigBox";
import Checkbox from "../../../Components/Inputs/Checkbox";
import TextInput from "../../../Components/Inputs/TextInput";
import VisuallyHiddenInput from "./Components/VisuallyHiddenInput";
import Image from "../../../Components/Image";
import LogoPlaceholder from "../../../assets/Images/logo_placeholder.svg";
import Breadcrumbs from "../../../Components/Breadcrumbs";
// Utils
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateStatusPage } from "../../StatusPage/Create/Hooks/useCreateStatusPage";
import { useLocation } from "react-router-dom";
import { statusPageValidation } from "../../../Validation/validation";
import { buildErrors } from "../../../Validation/error";
import { createToast } from "../../../Utils/toastUtils";
import { useNavigate } from "react-router-dom";

const CreateStatus = () => {
	const theme = useTheme();
	const { monitorId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isCreate = location.pathname.startsWith("/distributed-uptime/status/create");
	const [createStatusPage, isLoading, networkError] = useCreateStatusPage(isCreate);
	const BREADCRUMBS = [
		{ name: "distributed uptime", path: "/distributed-uptime" },
		{ name: "details", path: `/distributed-uptime/${monitorId}` },
		{ name: "create status page", path: `` },
	];
	// Local state
	const [form, setForm] = useState({
		isPublished: false,
		url: Math.floor(Math.random() * 1000000).toFixed(0),
		logo: undefined,
		companyName: "",
		monitors: [monitorId],
	});
	const [errors, setErrors] = useState({});

	const handleFormChange = (e) => {
		const { name, value, checked, type } = e.target;

		// Check for errors
		const { error } = statusPageValidation.validate(
			{ [name]: value },
			{ abortEarly: false }
		);

		setErrors((prev) => buildErrors(prev, name, error));

		if (type === "checkbox") {
			setForm({ ...form, [name]: checked });
			return;
		}
		setForm({ ...form, [name]: value });
	};

	const handleImageUpload = (e) => {
		const img = e.target?.files?.[0];
		setForm((prev) => ({
			...prev,
			logo: img,
		}));
	};
	const handleSubmit = async () => {
		let logoToSubmit = undefined;

		// Handle image
		if (typeof form.logo !== "undefined") {
			logoToSubmit = {
				src: URL.createObjectURL(form.logo),
				name: form.logo.name,
				type: form.logo.type,
				size: form.logo.size,
			};
		}
		const formToSubmit = { ...form };
		if (typeof logoToSubmit !== "undefined") {
			formToSubmit.logo = logoToSubmit;
		}

		// Validate
		const { error } = statusPageValidation.validate(formToSubmit, { abortEarly: false });
		if (typeof error === "undefined") {
			const success = await createStatusPage({ form: formToSubmit });
			if (success) {
				createToast({ body: "Status page created successfully" });
				navigate(`/distributed-uptime/status/${form.url}`);
			}
			return;
		}
		const newErrors = {};
		error?.details?.forEach((err) => {
			newErrors[err.path[0]] = err.message;
		});
		setErrors((prev) => ({ ...prev, ...newErrors }));
	};

	return (
		<Stack gap={theme.spacing(10)}>
			<Breadcrumbs list={BREADCRUMBS} />
			<Typography variant="h1">
				<Typography
					component="span"
					fontSize="inherit"
				>
					Create your{" "}
				</Typography>
				<Typography
					component="span"
					variant="h2"
					fontSize="inherit"
					fontWeight="inherit"
				>
					status page
				</Typography>
			</Typography>
			<ConfigBox>
				<Stack>
					<Typography component="h2">Access</Typography>
					<Typography component="p">
						If your status page is ready, you can mark it as published.
					</Typography>
				</Stack>
				<Stack gap={theme.spacing(18)}>
					<Checkbox
						id="publish"
						name="isPublished"
						label={`Published and visible to the public`}
						isChecked={form.isPublished}
						onChange={handleFormChange}
					/>
				</Stack>
			</ConfigBox>
			<ConfigBox>
				<Stack gap={theme.spacing(6)}>
					<Typography component="h2">Basic Information</Typography>
					<Typography component="p">
						Define company name and the subdomain that your status page points to.
					</Typography>
				</Stack>
				<Stack gap={theme.spacing(18)}>
					<TextInput
						id="companyName"
						name="companyName"
						type="text"
						label="Company name"
						placeholder="Company name"
						value={form.companyName}
						onChange={handleFormChange}
						helperText={errors["companyName"]}
						error={errors["companyName"] ? true : false}
					/>
					<TextInput
						id="url"
						name="url"
						type="url"
						label="Your status page address"
						value={form.url}
						onChange={handleFormChange}
						helperText={errors["url"]}
						error={errors["url"] ? true : false}
					/>
				</Stack>
			</ConfigBox>
			<ConfigBox>
				<Stack gap={theme.spacing(6)}>
					<Typography component="h2">Logo</Typography>
					<Typography component="p">Upload a logo for your status page </Typography>
				</Stack>
				<Stack
					gap={theme.spacing(18)}
					alignItems="center"
				>
					<Image
						src={form.logo ? URL.createObjectURL(form.logo) : undefined}
						alt="Logo"
						minWidth={"300px"}
						minHeight={"100px"}
						maxWidth={"300px"}
						maxHeight={"300px"}
						placeholder={LogoPlaceholder}
					/>
					<Box>
						<Button
							component="label"
							role={undefined}
							variant="contained"
							color="accent"
							tabIndex={-1}
						>
							Upload logo
							<VisuallyHiddenInput onChange={handleImageUpload} />
						</Button>
					</Box>
				</Stack>
			</ConfigBox>
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

export default CreateStatus;
