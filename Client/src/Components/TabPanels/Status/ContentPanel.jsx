import { useState, useContext, useEffect } from "react";
import { Button, Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import TabPanel from "@mui/lab/TabPanel";

import ConfigBox from "../../../Components/ConfigBox";
import { StatusFormContext } from "../../../Pages/Status/CreateStatusContext";
import { useSelector } from "react-redux";
import { logger } from "../../../Utils/Logger";
import { createToast } from "../../../Utils/toastUtils";
import { networkService } from "../../../main";
import ServersList from "./ServersList";
import Checkbox from "../../Inputs/Checkbox";

/**
 * Content Panel is used to compose the second part of the status page
 * for the servers/monitors to watch for in its public page presence and some
 * other server related configurations etc
 *
 */
const ContentPanel = () => {
	const theme = useTheme();
	const {
		form,
		setForm,
		errors,
		setErrors,
		handleBlur,
		handelCheckboxChange,
	} = useContext(StatusFormContext);
	const [cards, setCards] = useState([]);
	const { user, authToken } = useSelector((state) => state.auth);
	const [monitors, setMonitors] = useState([]);

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				const response = await networkService.getMonitorsByTeamId({
					authToken: authToken,
					teamId: user.teamId,
					limit: null, // donot return any checks for the monitors
					types: ["http"], // status page is available only for the uptime type
				});
				if (response.data.data.monitors.length == 0) {
					setErrors({ monitors: "Please config monitors to setup status page" });
				}
				const fullMonitors = response.data.data.monitors;
				setMonitors(fullMonitors);
				if (form.monitors.length > 0) {
					const initiCards = form.monitors.map((mid, idx) => ({
						id: "" + idx,
						val: fullMonitors.filter((fM) =>
							mid._id ? fM._id == mid._id : fM._id == mid
						)[0],
					}));
					setCards(initiCards);
				}
			} catch (error) {
				createToast({ body: "Failed to fetch monitors data" });
				logger.error("Failed to fetch monitors", error);
			}
		};
		fetchMonitors();
	}, [user, authToken]);
	const handleAddNew = () => {
		if (cards.length === monitors.length) return;
		const newCards = [...cards, { id: "" + Math.random(), val: {} }];
		setCards(newCards);
	};
	const removeCard = (id) => {
		const newCards = cards.filter((c) => c?.id != id);
		setCards(newCards);
		setForm({
			...form,
			monitors: newCards.filter((c) => c.val !== undefined).map((c) => c.val),
		});
	};

	return (
		<TabPanel
			value="Contents"
			sx={{
				"& h1, & p, & input": {
					color: theme.palette.text.tertiary,
				},
			}}
		>
			<Stack
				component="form"
				className="status-contents-form"
				noValidate
				spellCheck="false"
				gap={theme.spacing(12)}
				mt={theme.spacing(6)}
			>
				<ConfigBox>
					<Box>
						<Stack gap={theme.spacing(6)}>
							<Typography component="h2">Status page servers</Typography>
							<Typography component="p">
								You can add any number of servers that you monitor to your status page.
								You can also reorder them for the best viewing experience.
							</Typography>
						</Stack>
					</Box>
					<Stack
						className="status-contents-server-list"
						sx={{
							margin: theme.spacing(6),
							border: "solid",
							borderRadius: theme.shape.borderRadius,
							borderColor: theme.palette.border.light,
							borderWidth: "1px",
							transition: "0.2s",
							"&:hover": {
								borderColor: theme.palette.primary.main,
								backgroundColor: "hsl(215, 87%, 51%, 0.05)",
							},
						}}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
						>
							<Typography
								component="p"
								alignSelf={"center"}
							>
								{" "}
								Servers list{" "}
							</Typography>
							<Button
								onClick={handleAddNew}
								disabled={monitors.length === 0 || monitors.length <= cards.length}
							>
								Add new
							</Button>
						</Stack>

						<ServersList
							monitors={monitors}
							cards={cards}
							setCards={setCards}
							form={form}
							setForm={setForm}
							removeItem={removeCard}
						/>

						{errors["monitors"] && (
							<Typography
								component="span"
								className="input-error"
								color={theme.palette.error.main}
								sx={{
									opacity: 0.8,
								}}
							>
								{errors["monitors"]}
							</Typography>
						)}
					</Stack>
				</ConfigBox>

				<ConfigBox>
					<Box>
						<Stack gap={theme.spacing(6)}>
							<Typography component="h2">Features</Typography>
							<Typography component="p">Show more details on the status page</Typography>
						</Stack>
					</Box>
					<Stack sx={{ margin: theme.spacing(6) }}>
						<Checkbox
							id="showBarcode"
							label={`Show Barcode`}
							isChecked={form.showBarcode}
							onChange={handelCheckboxChange}
							onBlur={handleBlur}
						/>
						<Checkbox
							id="showUptimePercentage"
							label={`Show Uptime Percentage`}
							isChecked={form.showUptimePercentage}
							onChange={handelCheckboxChange}
							onBlur={handleBlur}
						/>
					</Stack>
				</ConfigBox>
			</Stack>
		</TabPanel>
	);
};

export default ContentPanel;
