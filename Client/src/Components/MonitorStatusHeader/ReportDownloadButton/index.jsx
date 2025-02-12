    import { useState } from "react";
    import { Box, Button } from "@mui/material";
    import { useTheme } from "@mui/material/styles";
    import { useSelector } from "react-redux";
    import FileDownloadIcon from "@mui/icons-material/FileDownload";
    import Select from "../../Inputs/Select";
    import { downloadReport } from "../../../Utils/Report/downloadReport";
    import PropTypes from "prop-types";
    import { networkService } from "../../../Utils/NetworkService";

    const options = [
        { _id: "html", name: "HTML Report" },
        { _id: "pdf", name: "Pdf Report" },
    ];

    const ReportDownloadButton = ({ monitorId, certificateExpiry, dateRange }) => {
        const [downloadFormat, setDownloadFormat] = useState(options[1]._id);
        const theme = useTheme();
        const { authToken } = useSelector((state) => state.auth);

        const handleDownload = async () => {
            try {
                const monitor = await networkService.getStatsByMonitorId({
                    authToken: authToken,
                    monitorId: monitorId,
                    dateRange: dateRange,
                    normalize: true,
                });
                await downloadReport({
                    monitorData: monitor?.data?.data,
                    downloadFormat,
                    certificateExpiry,
                });
            } finally {
                setDownloadFormat(options[1]._id);
            }
        };

        return (
            <Box
                alignSelf="flex-end"
                display="flex"
                alignItems="center"
            >
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
        monitorId: PropTypes.string.isRequired,
        certificateExpiry: PropTypes.string,
        dateRange: PropTypes.string.isRequired,
    };

    export default ReportDownloadButton;
