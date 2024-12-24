// React, Redux, Router
import { useTheme } from "@emotion/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// Utility and Network
import { checkEndpointResolution } from "../../../Features/UptimeMonitors/uptimeMonitorsSlice";
import { monitorValidation } from "../../../Validation/validation";
import { getUptimeMonitorById } from "../../../Features/UptimeMonitors/uptimeMonitorsSlice";
import { createUptimeMonitor } from "../../../Features/UptimeMonitors/uptimeMonitorsSlice";

// MUI
import { Box, Stack, Typography, Button, ButtonGroup } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

//Components
import Breadcrumbs from "../../../Components/Breadcrumbs";
import TextInput from "../../../Components/Inputs/TextInput";
import { HttpAdornment } from "../../../Components/Inputs/TextInput/Adornments";
import { createToast } from "../../../Utils/toastUtils";
import Radio from "../../../Components/Inputs/Radio";
import Checkbox from "../../../Components/Inputs/Checkbox";
import Select from "../../../Components/Inputs/Select";
import ConfigBox from "../../../Components/ConfigBox";
const CreateMonitor = () => {
	const MS_PER_MINUTE = 60000;
	const SELECT_VALUES = [
		{ _id: 1, name: "1 minute" },
		{ _id: 2, name: "2 minutes" },
		{ _id: 3, name: "3 minutes" },
		{ _id: 4, name: "4 minutes" },
		{ _id: 5, name: "5 minutes" },
	];

	const monitorTypeMaps = {
		http: {
			label: "URL to monitor",
			placeholder: "google.com",
			namePlaceholder: "Google",
		},
		ping: {
			label: "IP address to monitor",
			placeholder: "1.1.1.1",
			namePlaceholder: "Google",
		},
		docker: {
			label: "Container ID",
			placeholder: "abc123",
			namePlaceholder: "My Container",
		},
	};

	const { user, authToken } = useSelector((state) => state.auth);
	const { monitors, isLoading } = useSelector((state) => state.uptimeMonitors);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const theme = useTheme();
	const { monitorId } = useParams();
	const crumbs = [
		{ name: "uptime", path: "/uptime" },
		{ name: "create", path: `/uptime/create` },
	];

	// State
	const [errors, setErrors] = useState({});
	const [https, setHttps] = useState(true);
	const [monitor, setMonitor] = useState({
		url: "",
		name: "",
		type: "http",
		notifications: [],
		interval: 1,
	});

	const handleCreateMonitor = async (event) => {
		event.preventDefault();
		let form = {
			url:
				//prepending protocol for url
				monitor.type === "http"
					? `http${https ? "s" : ""}://` + monitor.url
					: monitor.url,
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
			createToast({ body: "Please check the form for errors." });
			return;
		}

		if (monitor.type === "http") {
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
		}

		form = {
			...form,
			description: form.name,
			teamId: user.teamId,
			userId: user._id,
			notifications: monitor.notifications,
		};
		const action = await dispatch(createUptimeMonitor({ authToken, monitor: form }));
		if (action.meta.requestStatus === "fulfilled") {
			createToast({ body: "Monitor created successfully!" });
			navigate("/uptime");
		} else {
			createToast({ body: "Failed to create monitor." });
		}
	};

	const handleChange = (event, formName) => {
		const { value } = event.target;
		setMonitor({
			...monitor,
			[formName]: value,
		});

		const { error } = monitorValidation.validate(
			{ [formName]: value },
			{ abortEarly: false }
		);
		setErrors((prev) => ({
			...prev,
			...(error ? { [formName]: error.details[0].message } : { [formName]: undefined }),
		}));
	};

	const handleNotifications = (event, type) => {
		const { value } = event.target;
		let notifications = [...monitor.notifications];
		const notificationExists = notifications.some((notification) => {
			if (notification.type === type && notification.address === value) {
				return true;
			}
			return false;
		});
		if (notificationExists) {
			notifications = notifications.filter((notification) => {
				if (notification.type === type && notification.address === value) {
					return false;
				}
				return true;
			});
		} else {
			notifications.push({ type, address: value });
		}

		setMonitor((prev) => ({
			...prev,
			notifications,
		}));
	};

	useEffect(() => {
		const fetchMonitor = async () => {
			if (monitorId) {
				const action = await dispatch(getUptimeMonitorById({ authToken, monitorId }));

				if (action.payload.success) {
					const data = action.payload.data;
					const { name, ...rest } = data; //data.name is read-only
					if (rest.type === "http") {
						const url = new URL(rest.url);
						rest.url = url.host;
					}
					rest.name = `${name} (Clone)`;
					rest.interval /= MS_PER_MINUTE;
					setMonitor({
						...rest,
					});
				} else {
					navigate("/not-found", { replace: true });
					createToast({
						body: "There was an error cloning the monitor.",
					});
				}
			}
		};
		fetchMonitor();
	}, [monitorId, authToken, monitors, dispatch, navigate]);

	return (
		<Box className="create-monitor">
			<Breadcrumbs list={crumbs} />
			<Stack
				component="form"
				gap={theme.spacing(12)}
				mt={theme.spacing(6)}
				onSubmit={handleCreateMonitor}
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
						variant="h2"
						fontSize="inherit"
						fontWeight="inherit"
					>
						monitor
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
							type={monitor.type === "http" ? "url" : "text"}
							id="monitor-url"
							startAdornment={
								monitor.type === "http" ? <HttpAdornment https={https} /> : null
							}
							label={monitorTypeMaps[monitor.type].label || "URL to monitor"}
							https={https}
							placeholder={monitorTypeMaps[monitor.type].placeholder || ""}
							value={monitor.url}
							onChange={(event) => handleChange(event, "url")}
							error={errors["url"] ? true : false}
							helperText={errors["url"]}
						/>
						<TextInput
							type="text"
							id="monitor-name"
							label="Display name"
							isOptional={true}
							value={monitor.name}
							onChange={(event) => handleChange(event, "name")}
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
								checked={monitor.type === "http"}
								onChange={(event) => handleChange(event, "type")}
							/>
							{monitor.type === "http" ? (
								<ButtonGroup sx={{ ml: theme.spacing(16) }}>
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
							) : (
								""
							)}
						</Stack>
						<Radio
							id="monitor-checks-ping"
							title="Ping monitoring"
							desc="Check whether your server is available or not."
							size="small"
							value="ping"
							checked={monitor.type === "ping"}
							onChange={(event) => handleChange(event, "type")}
						/>
						<Radio
							id="monitor-checks-docker"
							title="Docker container monitoring"
							desc="Check whether your container is running or not."
							size="small"
							value="docker"
							checked={monitor.type === "docker"}
							onChange={(event) => handleChange(event, "type")}
						/>
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
						<Checkbox
							id="notify-email-default"
							label={`Notify via email (to ${user.email})`}
							isChecked={monitor.notifications.some(
								(notification) => notification.type === "email"
							)}
							value={user?.email}
							onChange={(event) => handleNotifications(event, "email")}
						/>
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
							value={monitor.interval || 1}
							onChange={(event) => handleChange(event, "interval")}
							items={SELECT_VALUES}
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
						disabled={!Object.values(errors).every((value) => value === undefined)}
						loading={isLoading}
					>
						Create monitor
					</LoadingButton>
				</Stack>
			</Stack>
		</Box>
	);
};

export default CreateMonitor;
