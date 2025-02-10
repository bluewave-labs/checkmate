import "./reportStyles.css";
import { formatDurationRounded, formatDateWithWeekday } from "../timeUtils";
import { calculateDowntimeCount, calculatePingStats, calculateActiveRanges} from "./reportUtils";
import PropTypes from 'prop-types';



export const ProductReport = ({ monitorData, certificateExpiry }) => {
	const pingStats = calculatePingStats(monitorData.checks);

	const activeRanges = calculateActiveRanges(monitorData.checks);

	return (
		<div className="product-report">
			<div id="report-content">
				<h1>{monitorData.name} - monitoring report</h1>
				<p>Report generated on {new Date().toLocaleString()}</p>
				<hr />
				<div>
					<div>
						<h2>Basic information</h2>
						<div>
							<p>
								<span className="info-title">Site url:</span> {monitorData.url}
							</p>
							<p>
								<span className="info-title">Date added:</span>{" "}
								{formatDateWithWeekday(monitorData.createdAt)}
							</p>
							<p>
								<span className="info-title">Certificate expiration:</span>{" "}
								{certificateExpiry}
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Availability statistics</h2>
						<div>
							<p>
								<span className="info-title">Downtime count:</span>{" "}
								{calculateDowntimeCount(monitorData.checks)}{" "}
							</p>
							<p>
								<span className="info-title">Uptime percentage:</span>{" "}
								{Math.round(monitorData.periodUptime)} %
							</p>
							<p>
								<span className="info-title">Last checked:</span>{" "}
								{formatDateWithWeekday(monitorData.updatedAt)}
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Performance metrics</h2>
						<div>
							<p>
								<span className="info-title">Minimum ping:</span>{" "}
								{pingStats.min > 2000
									? (pingStats.min / 1000).toFixed(2) + "s"
									: pingStats.min + "ms"}
							</p>
							<p>
								<span className="info-title">Maximum ping:</span>{" "}
								{pingStats.max > 2000
									? (pingStats.max / 1000).toFixed(2) + "s"
									: pingStats.max + "ms"}
							</p>
							<p>
								<span className="info-title">Average ping:</span>{" "}
								{Math.round(monitorData.periodAvgResponseTime)}ms
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Monitoring details</h2>
						<div>
							<p>
								<span className="info-title">Total incidents:</span>{" "}
								{monitorData.periodIncidents}
							</p>
							<p>
								<span className="info-title">Total checks:</span>{" "}
								{monitorData.periodTotalChecks}
							</p>
							<p>
								<span className="info-title">Check interval:</span>{" "}
								{formatDurationRounded(monitorData.interval)}
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Activity times</h2>
						<div>
							<p>
								<span className="info-title">Active time:</span>{" "}
								{monitorData.isActive
									? formatDurationRounded(monitorData.uptimeDuration)
									: "0 sec"}
							</p>
							<p>
								<span className="info-title">Maximum active time:</span>{" "}
								{formatDurationRounded(activeRanges.max)}
							</p>
							<p>
								<span className="info-title">Minimum active time:</span>{" "}
								{formatDurationRounded(activeRanges.min)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

ProductReport.propTypes = {
	monitorData: PropTypes.object.isRequired,
	certificateExpiry: PropTypes.string.isRequired,
};
