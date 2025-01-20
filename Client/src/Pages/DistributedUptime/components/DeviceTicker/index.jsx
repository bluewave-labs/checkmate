import { Stack, Typography, List, ListItem } from "@mui/material";
import { useTheme } from "@emotion/react";
import PulseDot from "../../../../Components/Animated/PulseDot";
import "/node_modules/flag-icons/css/flag-icons.min.css";

const BASE_BOX_PADDING_VERTICAL = 16;
const BASE_BOX_PADDING_HORIZONTAL = 8;

function getRandomDevice() {
	const manufacturers = {
		Apple: ["iPhone 15 Pro Max", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13"],
		Samsung: [
			"Galaxy S23 Ultra",
			"Galaxy S23+",
			"Galaxy S23",
			"Galaxy Z Fold5",
			"Galaxy Z Flip5",
		],
		Google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7", "Pixel 6a"],
		OnePlus: [
			"OnePlus 11",
			"OnePlus 10T",
			"OnePlus Nord 3",
			"OnePlus 10 Pro",
			"OnePlus Nord 2T",
		],
		Xiaomi: ["13 Pro", "13", "Redmi Note 12", "POCO F5", "Redmi 12"],
		Huawei: ["P60 Pro", "Mate X3", "Nova 11", "P50 Pro", "Mate 50"],
		Sony: ["Xperia 1 V", "Xperia 5 V", "Xperia 10 V", "Xperia Pro-I", "Xperia 1 IV"],
		Motorola: ["Edge 40 Pro", "Edge 40", "G84", "G54", "Razr 40 Ultra"],
		ASUS: [
			"ROG Phone 7",
			"Zenfone 10",
			"ROG Phone 6",
			"Zenfone 9",
			"ROG Phone 7 Ultimate",
		],
	};

	const manufacturerNames = Object.keys(manufacturers);
	const randomManufacturer =
		manufacturerNames[Math.floor(Math.random() * manufacturerNames.length)];

	const models = manufacturers[randomManufacturer];
	const randomModel = models[Math.floor(Math.random() * models.length)];

	return {
		manufacturer: randomManufacturer,
		model: randomModel,
	};
}

const DeviceTicker = ({ data, width = "100%", connectionStatus }) => {
	const theme = useTheme();
	const statusColor = {
		up: theme.palette.success.main,
		down: theme.palette.error.main,
	};

	return (
		<Stack
			direction="column"
			gap={theme.spacing(2)}
			width={width}
			sx={{
				padding: `${theme.spacing(BASE_BOX_PADDING_VERTICAL)} ${theme.spacing(BASE_BOX_PADDING_HORIZONTAL)}`,
				backgroundColor: theme.palette.background.main,
				border: 1,
				borderStyle: "solid",
				borderColor: theme.palette.border.light,
			}}
		>
			<Stack
				direction="row"
				justifyContent={"center"}
				gap={theme.spacing(4)}
			>
				<PulseDot color={statusColor[connectionStatus]} />

				<Typography
					variant="h1"
					mb={theme.spacing(8)}
					sx={{ alignSelf: "center" }}
				>
					{connectionStatus === "up" ? "Connected" : "No connection"}
				</Typography>
			</Stack>
			<List>
				{data.slice(Math.max(data.length - 5, 0)).map((dataPoint) => {
					const countryCode = dataPoint?.countryCode?.toLowerCase() ?? null;
					const flag = countryCode ? `fi fi-${countryCode}` : null;
					const randomDevice = getRandomDevice();
					return (
						<ListItem key={Math.random()}>
							<Stack direction="column">
								<Stack
									direction="row"
									alignItems="center"
									gap={theme.spacing(4)}
								>
									{flag && <span className={flag} />}
									<Typography variant="h2">{dataPoint?.city || "Unknown"}</Typography>
								</Stack>
								<Typography variant="p">{`Response time: ${Math.floor(dataPoint?.responseTime ?? 0)} ms`}</Typography>
								<Typography variant="p">{`${randomDevice.manufacturer} ${randomDevice.model}`}</Typography>
							</Stack>
						</ListItem>
					);
				})}
			</List>
		</Stack>
	);
};

export default DeviceTicker;
