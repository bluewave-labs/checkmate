import { useParams } from "react-router-dom";
import DistributedUptimeMap from "../components/DistributedUptimeMap";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { Stack, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChartBox } from "../../Uptime/Details/styled";
import IconBox from "../../../Components/IconBox";
import ResponseTimeIcon from "../../../assets/icons/response-time-icon.svg?react";
import { useEffect, useState } from "react";
import DeviceTicker from "../components/DeviceTicker";
import DistributedUptimeResponseChart from "../components/DistributedUptimeResponseChart";
import UptimeIcon from "../../../assets/icons/uptime-icon.svg?react";

const BASE_BOX_PADDING_VERTICAL = 16;
const BASE_BOX_PADDING_HORIZONTAL = 8;

const generateDataPoint = () => {
  const cities = [
    { name: "New York", lat: 40.7128, long: -74.006 },
    { name: "Los Angeles", lat: 34.0522, long: -118.2437 },
    { name: "London", lat: 51.5074, long: -0.1278 },
    { name: "Tokyo", lat: 35.6895, long: 139.6917 },
    { name: "Sydney", lat: -33.8688, long: 151.2093 },
    { name: "Paris", lat: 48.8566, long: 2.3522 },
    { name: "Moscow", lat: 55.7558, long: 37.6173 },
    { name: "Beijing", lat: 39.9042, long: 116.4074 },
    { name: "Mumbai", lat: 19.076, long: 72.8777 },
    { name: "São Paulo", lat: -23.5505, long: -46.6333 },
    { name: "Cairo", lat: 30.0444, long: 31.2357 },
    { name: "Buenos Aires", lat: -34.6037, long: -58.3816 },
    { name: "Johannesburg", lat: -26.2041, long: 28.0473 },
    { name: "Istanbul", lat: 41.0082, long: 28.9784 },
    { name: "Seoul", lat: 37.5665, long: 126.978 },
    { name: "Mexico City", lat: 19.4326, long: -99.1332 },
    { name: "Bangkok", lat: 13.7563, long: 100.5018 },
    { name: "Lagos", lat: 6.5244, long: 3.3792 },
    { name: "Karachi", lat: 24.8607, long: 67.0011 },
    { name: "Jakarta", lat: -6.2088, long: 106.8456 },
    { name: "Rio de Janeiro", lat: -22.9068, long: -43.1729 },
    { name: "Lima", lat: -12.0464, long: -77.0428 },
    { name: "Tehran", lat: 35.6892, long: 51.389 },
    { name: "Kinshasa", lat: -4.4419, long: 15.2663 },
    { name: "Dhaka", lat: 23.8103, long: 90.4125 },
    { name: "Baghdad", lat: 33.3152, long: 44.3661 },
    { name: "Santiago", lat: -33.4489, long: -70.6693 },
    { name: "Riyadh", lat: 24.7136, long: 46.6753 },
    { name: "Singapore", lat: 1.3521, long: 103.8198 },
    { name: "Hong Kong", lat: 22.3193, long: 114.1694 },
  ];

  const devices = [
    { manufacturer: "Huawei", models: ["P30", "Mate 20", "Nova 5T"] },
    {
      manufacturer: "Samsung",
      models: ["Galaxy S21", "Galaxy Note 20", "Galaxy A51"],
    },
    { manufacturer: "Apple", models: ["iPhone 12", "iPhone 11", "iPhone SE"] },
    { manufacturer: "Xiaomi", models: ["Mi 11", "Redmi Note 10", "Poco X3"] },
    { manufacturer: "Oppo", models: ["Find X3", "Reno 5", "A74"] },
    { manufacturer: "Vivo", models: ["X60", "Y20", "V21"] },
    { manufacturer: "OnePlus", models: ["9 Pro", "8T", "Nord"] },
    { manufacturer: "Google", models: ["Pixel 5", "Pixel 4a", "Pixel 4"] },
  ];

  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomDevice = devices[Math.floor(Math.random() * devices.length)];
  const randomModel =
    randomDevice.models[Math.floor(Math.random() * randomDevice.models.length)];

  const avgResponseTime = Math.random() * (300 - 50) + 50;
  const totalChecks = Math.floor(Math.random() * 100) + 1;
  const originalAvgResponseTime = avgResponseTime;
  let responseColor;
  if (avgResponseTime <= 150) {
    responseColor = "#00FF00"; // Green
  } else if (avgResponseTime <= 250) {
    responseColor = "#FFFF00"; // Yellow
  } else {
    responseColor = "#FF0000"; // Red
  }

  return {
    _id: new Date().toISOString(),
    avgResponseTime,
    totalChecks,
    originalAvgResponseTime,
    location: {
      name: randomCity.name,
      lat: randomCity.lat,
      long: randomCity.long,
    },
    color: responseColor,
    device: { manufacturer: randomDevice.manufacturer, model: randomModel },
  };
};

const StatBox = ({ heading, value }) => {
  const theme = useTheme();
  return (
    <Box
      width={"25%"}
      sx={{
        padding: `${theme.spacing(BASE_BOX_PADDING_VERTICAL)} ${theme.spacing(BASE_BOX_PADDING_HORIZONTAL)}`,
        backgroundColor: theme.palette.background.main,
        border: 1,
        borderStyle: "solid",
        borderColor: theme.palette.border.light,
      }}
    >
      <Typography variant="h2">{heading}</Typography>
      <Typography>{value}</Typography>
    </Box>
  );
};

const DistributedUptimeDetails = () => {
  const theme = useTheme();
  const { monitorId } = useParams();
  const BREADCRUMBS = [
    { name: "Distributed Uptime", path: "/distributed-uptime" },
    { name: "Details", path: `/distributed-uptime/${monitorId}` },
  ];
  const [dummyData, setDummyData] = useState({
    groupChecks: [],
  });

  const [hoveredUptimeData, setHoveredUptimeData] = useState(null);
  const [hoveredIncidentsData, setHoveredIncidentsData] = useState(null);

  useEffect(() => {
    const generateRandomInterval = () =>
      Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;

    const intervalId = setInterval(() => {
      setDummyData((prevData) => ({
        groupChecks: [...prevData.groupChecks, generateDataPoint()],
      }));
      clearInterval(intervalId);
      setInterval(() => {
        setDummyData((prevData) => ({
          groupChecks: [...prevData.groupChecks, generateDataPoint()],
        }));
      }, generateRandomInterval());
    }, generateRandomInterval());

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Stack direction="column" gap={theme.spacing(8)}>
      <Breadcrumbs list={BREADCRUMBS} />
      <Stack direction="row" gap={theme.spacing(8)}>
        <StatBox heading="Total Devices" value={"2,600,000"} />
        <StatBox
          heading="Avg Response Time"
          value={
            dummyData.groupChecks.length > 0
              ? `${Math.floor(
                  dummyData.groupChecks.reduce(
                    (sum, dataPoint) => sum + dataPoint.avgResponseTime,
                    0
                  ) / dummyData.groupChecks.length
                )} ms`
              : "N/A"
          }
        />
        <StatBox
          heading="Data retrieved from"
          value={`${dummyData.groupChecks.length} devices`}
        />
        <StatBox heading="Tokens burnt" value={"15028"} />
      </Stack>
      <ChartBox sx={{ padding: 0 }}>
        <Stack pt={theme.spacing(8)} pl={theme.spacing(8)}>
          <IconBox>
            <ResponseTimeIcon />
          </IconBox>
          <Typography component="h2">Response Times</Typography>
        </Stack>
        <DistributedUptimeResponseChart checks={dummyData.groupChecks} />
      </ChartBox>
      <Stack direction="row" gap={theme.spacing(8)} height={"50vh"}>
        <DistributedUptimeMap
          checks={dummyData.groupChecks}
          height={"100%"}
          width={"100%"}
        />
        <DeviceTicker width={"25vw"} data={dummyData.groupChecks} />
      </Stack>
    </Stack>
  );
};

export default DistributedUptimeDetails;
