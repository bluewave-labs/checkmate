import { useState, useRef, useContext } from "react";
import { Box, Stack, Typography } from "@mui/material";
import ConfigBox  from "../../../Components/ConfigBox";
import Checkbox from "../../Inputs/Checkbox";
import { useTheme } from "@emotion/react";
import TabPanel from "@mui/lab/TabPanel";
import TextInput from "../../Inputs/TextInput";
import ImageField from "../../Inputs/Image";
import timezones from "../../../Utils/timezones.json";
import Select from "../../Inputs/Select";
import {
	logoImageValidation,
	publicPageGeneralSettingsValidation,
} from "../../../Validation/validation";
import { buildErrors } from "../../../Validation/error";
import { formatBytes } from "../../../Utils/fileUtils";
import ProgressUpload from "../../ProgressBars";
import ImageIcon from "@mui/icons-material/Image";
import { HttpAdornment } from "../../Inputs/TextInput/Adornments";
import { StatusFormContext } from "../../../Pages/Status/CreateStatusContext";

const GeneralSettingsPanel = () => {
	const theme = useTheme();	
	const [logo, setLogo] = useState();
	const { form, setForm, errors, setErrors  } = useContext(StatusFormContext);
	const [progress, setProgress] = useState({ value: 0, isLoading: false });
	const intervalRef = useRef(null);
	
	// Clears specific error from errors state
	const clearError = (err) => {
		setErrors((prev) => {
			const updatedErrors = { ...prev };
			if (updatedErrors[err]) delete updatedErrors[err];
			return updatedErrors;
		});
	};
	const removeLogo = () => {
		errors["logo"] && clearError("logo");
		setLogo({});
		setForm((prev) => ({
			...prev,
			logo: logo?.src,
		}));
		// interrupt interval if image upload is canceled prior to completing the process
		clearInterval(intervalRef.current);
		setProgress({ value: 0, isLoading: false });
	};

	const handleChange = (event) => {
		event.preventDefault();
		const { value, id } = event.target;
		setForm((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleBlur = (event) => {
		event.preventDefault();
		const { value, id } = event.target;
		const { error } = publicPageGeneralSettingsValidation.validate(
			{ [id]: value },
			{
				abortEarly: false,
			}
		);

		setErrors((prev) => {
			return buildErrors(prev, id, error);
		});
	};

	const validateField = (toValidate, schema, name = "logo") => {
		const { error } = schema.validate(toValidate, { abortEarly: false });
		setErrors((prev) => {
			let prevErrors = { ...prev };
			if (error) prevErrors[name] = error?.details[0].message;
			else delete prevErrors[name];
			return prevErrors;
		});
		if (error) return true;
	};

	const handleLogo = (event) => {
		const pic = event.target?.files?.[0];
		let error = validateField({ type: pic?.type, size: pic?.size }, logoImageValidation);
		if (error) return;

		setProgress((prev) => ({ ...prev, isLoading: true }));
		setLogo({
			src: URL.createObjectURL(pic),
			name: pic.name,
			type: pic.type,
			size: pic.size,
		});
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

	return (
		<TabPanel
			value="General Settings"
			sx={{
				"& h1, & p, & input": {
					color: theme.palette.text.tertiary,
				},
			}}
		>
			<Stack
				component="form"
				className="status-general-settings-form"
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
					<Stack gap={theme.spacing(6)}>
						<Checkbox
							id="published-to-public"
							label={`Published and visible to the public`}
							isChecked={form.publish}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					</Stack>
				</ConfigBox>

				<ConfigBox>
					<Box>
						<Stack gap={theme.spacing(6)}>
							<Typography component="h2">Basic Information</Typography>
							<Typography component="p">
								Define company name and the subdomain that your status page points to.
							</Typography>
						</Stack>
					</Box>
					<Stack gap={theme.spacing(18)}>
						<TextInput
							id="companyName"
							type="text"
							label="Company name"
							value={form.companyName}
							onChange={handleChange}
							onBlur={handleBlur}
							helperText={errors["companyName"]}
							error={errors["companyName"] ? true : false}
						/>
						<TextInput
							id="url"
							type="url"
							label="SubURL"
							value={form.url}
							startAdornment={<HttpAdornment prefix = {"http://uptimegenie.com/"} https={false} />}
							onChange={handleChange}
							onBlur={handleBlur}
							helperText={errors["url"]}
							error={errors["url"] ? true : false}
						/>
					</Stack>
				</ConfigBox>
				<ConfigBox>
					<Box>
						<Stack gap={theme.spacing(6)}>
							<Typography component="h2">Appearance</Typography>
							<Typography component="p">
								Define the default look and feel of your public status page.
							</Typography>
						</Stack>
					</Box>
					<Stack gap={theme.spacing(6)}>
						<Select
							id="display-timezone"
							label="Display timezone"
							value={form.timezone}
							onChange={handleChange}
							onBlur={handleBlur}
							items={timezones}
							error={errors["display-timezone"]}
						/>
						<ImageField
							id="logo"
							src={form.logo?.src ?? logo?.src}
							loading={progress.isLoading && progress.value !== 100}
							onChange={handleLogo}
							isRound={false}
						/>
						{progress.isLoading || progress.value !== 0 || errors["logo"] ? (
							<ProgressUpload
								icon={<ImageIcon />}
								label={logo?.name}
								size={formatBytes(logo?.size)}
								progress={progress.value}
								onClick={removeLogo}
								error={errors["logo"]}
							/>
						) : (
							""
						)}
						<TextInput
							id="color"
							label="Color"
							value={form.color}
							error={errors["color"]}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
					</Stack>
				</ConfigBox>
			</Stack>
		</TabPanel>
	);
};

export default GeneralSettingsPanel;
