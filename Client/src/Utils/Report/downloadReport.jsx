import { createRoot } from "react-dom/client";
import { ProductReport } from "./report";
import html2pdf from "html2pdf.js";

export const downloadReport = ({ monitorData, downloadFormat, certificateExpiry }) => {
	// Create a detached div to render the report
	const tempDiv = document.createElement("div"); // Create a promise to handle the rendering and download
	return new Promise((resolve) => {
		// Use ReactDOM to render the report into the detached div
		const reportRoot = createRoot(tempDiv);
		reportRoot.render(
			<ProductReport
				monitorData={monitorData}
				certificateExpiry={certificateExpiry}
			/>
		); 
		
		//setTimeout to allow the rendering to complete from React rendering and browser engine DOM updates. 
		setTimeout(() => {
			try {
				// Create the HTML content from the detached div
				const htmlContent = `
					<!DOCTYPE html>
					<html lang="en">
					<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Product Report</title>
					</head>
					<body>
					${tempDiv.innerHTML}
					</body>
					</html>`;
				if (downloadFormat === "html") {
					// Create and trigger HTML download
					const blob = new Blob([htmlContent], { type: "text/html" });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `${monitorData.name}-monitor-report-${new Date().toISOString().split("T")[0]}.html`;
					// Programmatically trigger download
					a.style.display = "none"; // prevent page jump
					document.body.appendChild(a); // required for firefox to work properly
					a.click(); // Cleanup
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				} else if (downloadFormat === "pdf") {
					// Create and trigger PDF download
					html2pdf()
						.from(htmlContent)
						.save(
							`${monitorData.name}-monitor-report-${new Date().toISOString().split("T")[0]}.pdf`
						);
				}
			} finally {
				// Always cleanup
				reportRoot.unmount();
				resolve();
			}
		}, 0);
	});
};
