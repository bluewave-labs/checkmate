import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Select from "../../Inputs/Select";
import { downloadReport } from "../../../Utils/Report/downloadReport";
import PropTypes from 'prop-types';

const options = [
    { _id: "html", name: "HTML Report" },
    { _id: "pdf", name: "Pdf Report" },
];

const ReportDownloadButton = ({ shouldRender, monitor, certificateExpiry }) => {
    const [downloadFormat, setDownloadFormat] = useState(options[1]._id);
	const theme = useTheme();

    if (!shouldRender) return null;
	if(!monitor) return null;

    const handleDownload = async () => {
        try {
            console.log(monitor);
            await downloadReport({
                monitorData: monitor,
                downloadFormat,
                certificateExpiry,
            });
        } finally {
			setDownloadFormat(options[1]._id);
		}
    };

    return (
        <Box alignSelf="flex-end" display="flex" alignItems="center">
            <Select
                id="report-format-select"
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                items={options}
            />
            <Button
                variant="contained"
                color="secondary"
                onClick={handleDownload}
                disabled={!downloadFormat}
				sx={{
					px: theme.spacing(5),
					"& svg": {
						mr: theme.spacing(3),
						"& path": {
							/* Should always be contrastText for the button color */
							stroke: theme.palette.secondary.contrastText,
						},
					},
				}}
            >
                <FileDownloadIcon />
            </Button>
        </Box>
    );
};

ReportDownloadButton.propTypes = {
    shouldRender: PropTypes.bool,
    monitor: PropTypes.object,
    certificateExpiry: PropTypes.string,
};

export default ReportDownloadButton;