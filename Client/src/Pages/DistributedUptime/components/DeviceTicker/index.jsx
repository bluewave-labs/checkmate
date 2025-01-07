import { Stack, Typography, List, ListItem } from "@mui/material";
import { useTheme } from "@emotion/react";

const BASE_BOX_PADDING_VERTICAL = 16;
const BASE_BOX_PADDING_HORIZONTAL = 8;

const DeviceTicker = ({ data, width = "100%" }) => {
  const theme = useTheme();
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
      <Typography
        variant="h1"
        mb={theme.spacing(8)}
        sx={{ alignSelf: "center" }}
      >
        Live data
      </Typography>
      <List>
        {data.slice(Math.max(data.length - 5, 0)).map((dataPoint) => {
          return (
            <ListItem>
              <Stack direction="column">
                <Typography variant="h2">{dataPoint.location.name}</Typography>
                <Typography variant="p">{`Response time: ${Math.floor(dataPoint.avgResponseTime)} ms`}</Typography>
                <Typography variant="p">{`${dataPoint.device.manufacturer} ${dataPoint.device.model}`}</Typography>
              </Stack>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
};

export default DeviceTicker;
