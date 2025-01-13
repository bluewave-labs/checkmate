// Components
import { Box, Stack, Typography, Button, ButtonGroup } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import Breadcrumbs from "../../../Components/Breadcrumbs";
import ConfigBox from "../../../Components/ConfigBox";
import TextInput from "../../../Components/Inputs/TextInput";
import { HttpAdornment } from "../../../Components/Inputs/TextInput/Adornments";
import Radio from "../../../Components/Inputs/Radio";
import Checkbox from "../../../Components/Inputs/Checkbox";
import Select from "../../../Components/Inputs/Select";

// Utility
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { monitorValidation } from "../../../Validation/validation";

// Constants
const BREADCRUMBS = [
	{ name: `distributed uptime`, path: "/distributed-uptime" },
	{ name: "create", path: `/distributed-uptime/create` },
];
const MS_PER_MINUTE = 60000;
const SELECT_VALUES = [
	{ _id: 1, name: "1 minute" },
	{ _id: 2, name: "2 minutes" },
	{ _id: 3, name: "3 minutes" },
	{ _id: 4, name: "4 minutes" },
	{ _id: 5, name: "5 minutes" },
];

const CreateDistributedUptime = () => {
	// Redux state
	const { user, authToken } = useSelector((state) => state.auth);

	// Local state
	const [https, setHttps] = useState(true);
	const [notifications, setNotifications] = useState([]);
	const [monitor, setMonitor] = useState({
		type: "http",
	});
	const [errors, setErrors] = useState({});

	// Handlers
	const handleCreateMonitor = async (event) => {
		const { error } = monitorValidation.validate(monitor, {
			abortEarly: false,
		});

		console.log(monitor, error);
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setMonitor({
			...monitor,
			[name]: value,
		});
		const { error } = monitorValidation.validate(
			{ [name]: value },
			{ abortEarly: false }
		);

		setErrors((prev) => ({
			...prev,
			...(error ? { [name]: error.details[0].message } : { [name]: undefined }),
		}));

		console.log(error);
	};

	const theme = useTheme();
	return (
		<Box>
			<Breadcrumbs list={BREADCRUMBS} />
			<Stack
				component="form"
				gap={theme.spacing(12)}
				mt={theme.spacing(6)}
				onSubmit={() => console.log("submit")}
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
							type={"url"}
							id="monitor-url"
							startAdornment={<HttpAdornment https={https} />}
							label="URL to monitor"
							https={https}
							placeholder={"www.google.com"}
							value={monitor.url}
							name="url"
							onChange={handleChange}
							error={errors["url"] ? true : false}
							helperText={errors["url"]}
						/>
						<TextInput
							type="text"
							id="monitor-name"
							label="Display name"
							isOptional={true}
							placeholder={"Google"}
							value={monitor.name}
							name="name"
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
								checked={true}
								onChange={(event) => console.log(event)}
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

						{/* {errors["type"] ? (
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
						)} */}
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
							isChecked={notifications.some(
								(notification) => notification.type === "email"
							)}
							value={user?.email}
							onChange={(event) => console.log(event)}
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
							onChange={(event) => console.log(event)}
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
						onClick={() => handleCreateMonitor()}
						// disabled={!Object.values(errors).every((value) => value === undefined)}
						// loading={isLoading}
					>
						Create monitor
					</LoadingButton>
				</Stack>
			</Stack>
		</Box>
	);
};

export default CreateDistributedUptime;
