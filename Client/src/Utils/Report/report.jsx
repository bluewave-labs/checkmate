import "./reportStyles.css";
import { formatDurationRounded, formatDateWithWeekday } from "../timeUtils";

const calculateDowntimeCount = (checks) => {
	if (!checks || checks.length < 2) return 0;

	let downtimeCount = 0;
	for (let i = 0; i < checks.length - 1; i++) {
		const currentCheck = checks[i];
		const nextCheck = checks[i + 1];

		if (currentCheck.status === true && nextCheck.status === false) {
			downtimeCount++;
		}
	}
	return downtimeCount;
};

const calculatePingStats = (checks) => {
	if (!checks || checks.length === 0) return { min: 0, max: 0 };

	let min = Number.MAX_SAFE_INTEGER;
	let max = 0;

	checks.forEach((check) => {
		if (check.originalResponseTime) {
			min = Math.min(min, check.originalResponseTime);
			max = Math.max(max, check.originalResponseTime);
		}
	});

	return {
		min: min === Number.MAX_SAFE_INTEGER ? 0 : min,
		max: max,
	};
};

const calculateActiveRanges = (checks) => {
	if (!checks || checks.length < 2) return { min: 0, max: 0 };

	const durations = [];
	let startTime = null;

	for (let i = checks.length - 1; i >= 0; i--) {
		const check = checks[i];

		if (check.status && !startTime) {
			startTime = new Date(check.createdAt);
		}

		if (!check.status && startTime) {
			const endTime = new Date(check.createdAt);
			const duration = endTime - startTime;
			if (duration > 0) {
				durations.push(duration);
			}
			startTime = null;
		}
	}

	// Handle case where site is currently up
	if (startTime && checks[0].status) {
		const now = new Date();
		const duration = now - startTime;
		durations.push(duration);
	}

	return durations.length
		? {
				min: Math.min(...durations),
				max: Math.max(...durations),
			}
		: { min: 0, max: 0 };
};

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
