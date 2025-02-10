import { createRoot } from "react-dom/client";
import { ProductReport } from "./report";
import html2pdf from "html2pdf.js";

export const downloadReport = ({ monitorData, downloadFormat, certificateExpiry }) => {
	// Create a temporary div to render the report
	const tempDiv = document.createElement("div");
	tempDiv.style.position = "absolute";
	tempDiv.style.left = "-9999px";
	document.body.appendChild(tempDiv);

	// Create a promise to handle the rendering and download
	return new Promise((resolve) => {
		// Use ReactDOM to render the report
		const reportRoot = createRoot(tempDiv);
		reportRoot.render(
			<ProductReport
				monitorData={monitorData}
				certificateExpiry={certificateExpiry}
			/>
		);

		// Wait for styles to be applied
		setTimeout(() => {
			try {
				// Create the HTML content
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
						document.body.appendChild(a);
						a.click();
	
						// Cleanup
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
					} else if (downloadFormat === "pdf") {
						// Create and trigger PDF download
						html2pdf().from(htmlContent).save(`${monitorData.name}-monitor-report-${new Date().toISOString().split("T")[0]}.pdf`);
					}
			} finally {
				// Always cleanup
				reportRoot.unmount();
				document.body.removeChild(tempDiv);
				resolve();
			}
		}, 100);
	});
};
