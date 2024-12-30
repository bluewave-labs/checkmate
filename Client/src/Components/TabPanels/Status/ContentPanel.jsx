import { useState, useCallback, useContext, useEffect } from "react";
import { Button, Box, Stack, Typography } from "@mui/material";
import ConfigBox from "../../../Components/ConfigBox";
import { useTheme } from "@emotion/react";
import TabPanel from "@mui/lab/TabPanel";
import Card from "./Card";
import update from "immutability-helper";
import { StatusFormContext } from "../../../Pages/Status/CreateStatusContext";
import { useSelector } from "react-redux";
import { logger } from "../../../Utils/Logger"
import { createToast } from "../../../Utils/toastUtils";
import { networkService } from "../../../main";

const ContentPanel = () => {
	const theme = useTheme();
	const { form, setForm, errors, setErrors } = useContext(StatusFormContext);
	const [cards, setCards] = useState([]);
	const {user, authToken } = useSelector((state) => state.auth);	
	const [monitors, setMonitors] = useState([]);

	useEffect(() => {
		const fetchMonitors = async () => {
			try {
				const response = await networkService.getMonitorsByTeamId({
					authToken: authToken,
					teamId: user.teamId,
					limit: -1,
					types: ["http", "ping", "pagespeed", "hardware"],
				});
				if(response.data.data.monitors.length==0){
					setErrors({monitors: "Please config monitors to setup status page"})
				}
				const fullMonitors = response.data.data.monitors ;
				setMonitors(fullMonitors);
				if (form.monitors.length > 0)
					setCards(
						form.monitors.map((mid, idx) => ({
							id: "" + idx,
							val: fullMonitors.filter((fM) => fM._id == mid)[0],
						}))
					);
			} catch (error) {
				createToast({ body: "Failed to fetch monitors data" });
				logger.error("Failed to fetch monitors", error);
			}
		};			
		fetchMonitors();
	}, [user, authToken]);

	const moveCard = useCallback(
		(dragIndex, hoverIndex) => {
			const dragCard = cards[dragIndex];
			setCards(
				update(cards, {
					$splice: [
						[dragIndex, 1],
						[hoverIndex, 0, dragCard],
					],
				})
			);
		},
		[cards]
	);

	const handleCardChange = (event, val) => {
		event.preventDefault();
		const { id } = event.target;
		let idx = cards.findIndex((a) => {
			let found = false;
			let optionIdx = id.indexOf("-option");
			if (optionIdx !== -1) found = a.id == id.substr(0, optionIdx);
			else found = a.id == id;
			return found;
		});
		let newCards;
		if (idx >= 0) {
			let x = JSON.parse(JSON.stringify(cards[idx]));
			x.val = val;
			newCards = update(cards, { $splice: [[idx, 1, x]] });
			setCards(newCards);
		} else {
			newCards = update(cards, { $push: [{ id: id, val: val }] });
			setCards(newCards);
		}
		setForm({ ...form, monitors: newCards.map(c=>c.val) });
	};
	const handleAddNew = () => {
		if (cards.length === monitors.length) return;
		const newCards = [...cards, { id: "" + Math.random() }];
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
					<Box
						className="status-contents-server-list"
						sx={{
							margin: theme.spacing(20),
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
							justifyContent="space-around"
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
								Add New
							</Button>
						</Stack>
						{cards.length > 0 && (
							<Stack
								id="monitors"
								direction="column"
								gap={theme.spacing(2)}
							>
								{cards.map((card, idx) => {
									return (
										<Card
											key={idx}
											index={idx}
											id={card?.id ?? "" + Math.random()}
											text={"" + idx}
											moveCard={moveCard}
											removeCard={removeCard}
											value={card.val ?? {}}
											onChange={handleCardChange}
											monitors={monitors}
										/>
									);
								})}
							</Stack>
						)}
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
					</Box>
				</ConfigBox>

				<ConfigBox>
					<Box>
						<Stack gap={theme.spacing(6)}>
							<Typography component="h2">Features</Typography>
							<Typography component="p">Show more details on the status page</Typography>
						</Stack>
					</Box>
					{/* <Stack	sx={{margin: theme.spacing(20)}}
					>
						<Checkbox
							id="show-barcode"
							label={`Show Barcode`}
							isChecked={form.showBarcode}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
						<Checkbox
							id="show-uptime-percentage"
							label={`Show Uptime Percentage`}
							isChecked={form.showUptimePercentage}
							onChange={handleChange}
							onBlur={handleBlur}
						/>						
					</Stack> */}
				</ConfigBox>
			</Stack>
		</TabPanel>
	);
};

export default ContentPanel;
