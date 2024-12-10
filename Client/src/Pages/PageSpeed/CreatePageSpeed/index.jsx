import { useState } from "react";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useSelector, useDispatch } from "react-redux";
import { monitorValidation } from "../../../Validation/validation";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import {
	createPageSpeed,
	checkEndpointResolution,
} from "../../../Features/PageSpeedMonitor/pageSpeedMonitorSlice";
import { createToast } from "../../../Utils/toastUtils";
import { logger } from "../../../Utils/Logger";
import { ConfigBox } from "../../Uptime/styled";
import Radio from "../../../Components/Inputs/Radio";
import TextInput from "../../../Components/Inputs/TextInput";
import { HttpAdornment } from "../../../Components/Inputs/TextInput/Adornments";
import Select from "../../../Components/Inputs/Select";
import Checkbox from "../../../Components/Inputs/Checkbox";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { parseDomainName } from "../../../Utils/monitorUtils";
import "./index.css";

const CreatePageSpeed = () => {
	const MS_PER_MINUTE = 60000;
	const { user, authToken } = useSelector((state) => state.auth);
	const { isLoading } = useSelector((state) => state.pageSpeedMonitors);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const theme = useTheme();

	const idMap = {
		"monitor-url": "url",
		"monitor-name": "name",
		"monitor-checks-http": "type",
		"monitor-checks-ping": "type",
		"notify-email-default": "notification-email",
	};

	const [monitor, setMonitor] = useState({
		url: "",
		name: "",
		type: "pagespeed",
		notifications: [],
		interval: 3,
	});
	const [https, setHttps] = useState(true);
	const [errors, setErrors] = useState({});

	const handleChange = (event, name) => {
		const { value, id } = event.target;
		if (!name) name = idMap[id];

		if (name.includes("notification-")) {
			name = name.replace("notification-", "");
			let hasNotif = monitor.notifications.some(
				(notification) => notification.type === name
			);
			setMonitor((prev) => {
				const notifs = [...prev.notifications];
				if (hasNotif) {
					return {
						...prev,
						notifications: notifs.filter((notif) => notif.type !== name),
					};
				} else {
					return {
						...prev,
						notifications: [
							...notifs,
							name === "email"
								? { type: name, address: value }
								: // TODO - phone number
									{ type: name, phone: value },
						],
					};
				}
			});
		} else {
			setMonitor((prev) => ({
				...prev,
				[name]: value,
			}));

			const { error } = monitorValidation.validate(
				{ [name]: value },
				{ abortEarly: false }
			);

			setErrors((prev) => {
				const updatedErrors = { ...prev };
				if (error) updatedErrors[name] = error.details[0].message;
				else delete updatedErrors[name];
				return updatedErrors;
			});
		}
	};

	const onUrlBlur = (event) => {
		const { value } = event.target;
		if (monitor.name === "") {
			setMonitor((prev) => ({
				...prev,
				name: parseDomainName(value),
			}));
		}
	};

	const handleCreateMonitor = async (event) => {
		event.preventDefault();
		//obj to submit
		let form = {
			url: `http${https ? "s" : ""}://` + monitor.url,
			name: monitor.name === "" ? monitor.url : monitor.name,
			type: monitor.type,
			interval: monitor.interval * MS_PER_MINUTE,
		};

		const { error } = monitorValidation.validate(form, {
			abortEarly: false,
		});

		if (error) {
			const newErrors = {};
			error.details.forEach((err) => {
				newErrors[err.path[0]] = err.message;
			});
			setErrors(newErrors);
			createToast({ body: "Error validation data." });
		} else {
			const checkEndpointAction = await dispatch(
				checkEndpointResolution({ authToken, monitorURL: form.url })
			);
			if (checkEndpointAction.meta.requestStatus === "rejected") {
				createToast({
					body: "The endpoint you entered doesn't resolve. Check the URL again.",
				});
				setErrors({ url: "The entered URL is not reachable." });
				return;
			}

			form = {
				...form,
				description: form.name,
				teamId: user.teamId,
				userId: user._id,
				notifications: monitor.notifications,
			};
			const action = await dispatch(createPageSpeed({ authToken, monitor: form }));
			if (action.meta.requestStatus === "fulfilled") {
				createToast({ body: "Monitor created successfully!" });
				navigate("/pagespeed");
			} else {
				createToast({ body: "Failed to create monitor." });
			}
		}
	};

	//select values
	const frequencies = [
		{ _id: 3, name: "3 minutes" },
		{ _id: 5, name: "5 minutes" },
		{ _id: 10, name: "10 minutes" },
		{ _id: 20, name: "20 minutes" },
		{ _id: 60, name: "1 hour" },
		{ _id: 1440, name: "1 day" },
		{ _id: 10080, name: "1 week" },
	];
	return (
		<Box
			className="create-monitor"
			sx={{
				"& h1": {
					color: theme.palette.text.primary,
				},
			}}
		>
			<Breadcrumbs
				list={[
					{ name: "pagespeed", path: "/pagespeed" },
					{ name: "create", path: `/pagespeed/create` },
				]}
			/>
			<Stack
				component="form"
				className="create-monitor-form"
				onSubmit={handleCreateMonitor}
				noValidate
				spellCheck="false"
				gap={theme.spacing(12)}
				mt={theme.spacing(6)}
			>
				<Typography
					component="h1"
					variant="h1"
				>
					<Typography
						component="span"
						fontSize="inherit"
					>
						Create your{" "}
					</Typography>
					<Typography
						component="span"
						fontSize="inherit"
						fontWeight="inherit"
						color={theme.palette.text.secondary}
					>
						pagespeed monitor
					</Typography>
				</Typography>
				<ConfigBox>
					<Box>
						<Typography component="h2">General settings</Typography>
						<Typography component="p">
							Here you can select the URL of the host, together with the type of monitor.
						</Typography>
					</Box>
					<Stack gap={theme.spacing(15)}>
						<TextInput
							type={"url"}
							id="monitor-url"
							label="URL to monitor"
							startAdornment={<HttpAdornment https={https} />}
							placeholder="google.com"
							value={monitor.url}
							onChange={handleChange}
							onBlur={onUrlBlur}
							error={errors["url"] ? true : false}
							helperText={errors["url"]}
						/>
						<TextInput
							type="text"
							id="monitor-name"
							label="Display name"
							isOptional={true}
							placeholder="Google"
							value={monitor.name}
							onChange={handleChange}
							error={errors["name"] ? true : false}
							helperText={errors["name"]}
						/>
					</Stack>
				</ConfigBox>
				<ConfigBox>
					<Box>
						<Typography component="h2">Checks to perform</Typography>
						<Typography component="p">
							You can always add or remove checks after adding your site.
						</Typography>
					</Box>
					<Stack gap={theme.spacing(12)}>
						<Stack gap={theme.spacing(6)}>
							<Radio
								id="monitor-checks-http"
								title="Website monitoring"
								desc="Use HTTP(s) to monitor your website or API endpoint."
								size="small"
								value="http"
								checked={monitor.type === "pagespeed"}
								onChange={(event) => handleChange(event)}
							/>
							<ButtonGroup sx={{ ml: "32px" }}>
								<Button
									variant="group"
									filled={https.toString()}
									onClick={() => setHttps(true)}
								>
									HTTPS
								</Button>
								<Button
									variant="group"
									filled={(!https).toString()}
									onClick={() => setHttps(false)}
								>
									HTTP
								</Button>
							</ButtonGroup>
						</Stack>
						{errors["type"] ? (
							<Box className="error-container">
								<Typography
									component="p"
									className="input-error"
									color={theme.palette.error.contrastText}
								>
									{errors["type"]}
								</Typography>
							</Box>
						) : (
							""
						)}
					</Stack>
				</ConfigBox>
				<ConfigBox>
					<Box>
						<Typography component="h2">Incident notifications</Typography>
						<Typography component="p">
							When there is an incident, notify users.
						</Typography>
					</Box>
					<Stack gap={theme.spacing(6)}>
						<Typography component="p">When there is a new incident,</Typography>
						<Checkbox
							id="notify-sms"
							label="Notify via SMS (coming soon)"
							isChecked={false}
							value=""
							onChange={() => logger.warn("disabled")}
							isDisabled={true}
						/>
						<Checkbox
							id="notify-email-default"
							label={`Notify via email (to ${user.email})`}
							isChecked={monitor.notifications.some(
								(notification) => notification.type === "email"
							)}
							value={user?.email}
							onChange={(event) => handleChange(event)}
						/>
						<Checkbox
							id="notify-email"
							label="Also notify via email to multiple addresses (coming soon)"
							isChecked={false}
							value=""
							onChange={() => logger.warn("disabled")}
							isDisabled={true}
						/>
						{monitor.notifications.some(
							(notification) => notification.type === "emails"
						) ? (
							<Box mx={theme.spacing(16)}>
								<TextInput
									id="notify-email-list"
									type="text"
									placeholder="name@gmail.com"
									value=""
									onChange={() => logger.warn("disabled")}
								/>
								<Typography mt={theme.spacing(4)}>
									You can separate multiple emails with a comma
								</Typography>
							</Box>
						) : (
							""
						)}
					</Stack>
				</ConfigBox>
				<ConfigBox>
					<Box>
						<Typography component="h2">Advanced settings</Typography>
					</Box>
					<Stack gap={theme.spacing(12)}>
						<Select
							id="monitor-interval"
							label="Check frequency"
							value={monitor.interval || 3}
							onChange={(event) => handleChange(event, "interval")}
							items={frequencies}
						/>
					</Stack>
				</ConfigBox>
				<Stack
					direction="row"
					justifyContent="flex-end"
				>
					<LoadingButton
						variant="contained"
						color="primary"
						onClick={handleCreateMonitor}
						disabled={Object.keys(errors).length !== 0 && true}
						loading={isLoading}
					>
						Create monitor
					</LoadingButton>
				</Stack>
			</Stack>
		</Box>
	);
};

export default CreatePageSpeed;
