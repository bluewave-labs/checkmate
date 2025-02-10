import { useState } from "react";
import DropDownButton from "../../DropDownButton";
import { Box } from "@mui/material";
import {downloadReport} from "../../../Utils/Report/downloadReport";
import PropTypes from 'prop-types';

const options = [
    { name: "Download HTML Report", tag: "html" },
    { name: "Download Pdf Report", tag: "pdf" },
]

const ReportDownloadButton = ({ shouldRender, monitor, certificateExpiry }) => {
	const [downloadFormat, setDownloadFormat] = useState("pdf");
    if (!shouldRender) return null;

	const handleDownload = async () => {
		try {
			console.log(monitor);
			await downloadReport({
				monitorData: monitor,
				downloadFormat,
				certificateExpiry,
			});
		} finally {
			setDownloadFormat("pdf"); //passing pdf as default
		}
	};

	return (
		<Box alignSelf="flex-end">
			<DropDownButton options={options}
			hanldeClick={handleDownload}
			setValue={setDownloadFormat}/>
			
		</Box>
	);
};

ReportDownloadButton.propTypes = {
	shouldRender: PropTypes.bool,
	monitor: PropTypes.object,
	certificateExpiry: PropTypes.string,
};

export default ReportDownloadButton;
