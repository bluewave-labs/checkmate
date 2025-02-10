import "./reportStyles.css";

const formatDate = (dateString) => {
	const options = {
		weekday: "short",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	};
	return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
};
const formatUptimeStreak = (uptimeStreak) => {
	const seconds = Math.floor(uptimeStreak / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} day${days > 1 ? "s" : ""}`;
	} else if (hours > 0) {
		return `${hours} hour${hours > 1 ? "s" : ""}`;
	} else if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? "s" : ""}`;
	} else {
		return `${seconds} second${seconds > 1 ? "s" : ""}`;
	}
};
// const timeSince = (dateString) => {
//     const now = new Date();
//     const updatedAt = new Date(dateString);
//     const difference = now - updatedAt;

// 	return formatUptimeStreak(difference);
// };

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
				<h1>{monitorData.name} Monitoring Report</h1>
				<hr/>
				<div>
					<div>
						<h2>Basic Information</h2>
						<div>
							<p>
								<span className="info-title">Site URL:</span> {monitorData.url}
							</p>
							<p>
								<span className="info-title">Date Added:</span>{" "}
								{formatDate(monitorData.createdAt)}
							</p>
							<p><span className="info-title">Certificate Expiration:</span> {certificateExpiry}</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Availability Statistics</h2>
						<div>
							<p>
								<span className="info-title">Downtime Count:</span>{" "}
								{calculateDowntimeCount(monitorData.checks)}{" "}
							</p>
							<p>
								<span className="info-title">Uptime Percentage:</span>{" "}
								{Math.round(monitorData.periodUptime)} %
							</p>
							<p>
								<span className="info-title">Last Checked:</span>{" "}
								{formatDate(monitorData.updatedAt)}
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Performance Metrics</h2>
						<div>
							<p>
								<span className="info-title">Minimum Ping:</span> {pingStats.min}ms
							</p>
							<p>
								<span className="info-title">Maximum Ping:</span> {pingStats.max}ms
							</p>
							<p>
								<span className="info-title">Average Ping:</span>{" "}
								{Math.round(monitorData.groupedAvgResponseTime.avgResponseTime)}ms
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Monitoring Details</h2>
						<div>
							<p>
								<span className="info-title">Total Incidents:</span>{" "}
								{monitorData.periodIncidents}
							</p>
							<p>
								<span className="info-title">Total Checks:</span>{" "}
								{monitorData.periodTotalChecks}
							</p>
							<p>
								<span className="info-title">Check Interval:</span>{" "}
								{formatUptimeStreak(monitorData.interval)}
							</p>
						</div>
					</div>
					<hr />
					<div>
						<h2>Activity Times</h2>
						<div>
							<p>
								<span className="info-title">Active Time:</span>{" "}
								{monitorData.isActive
									? formatUptimeStreak(monitorData.uptimeDuration)
									: "0 sec"}
							</p>
							<p>
								<span className="info-title">Maximum Active Time:</span>{" "}
								{formatUptimeStreak(activeRanges.max)}
							</p>
							<p>
								<span className="info-title">Minimum Active Time:</span>{" "}
								{formatUptimeStreak(activeRanges.min)}
							</p>
						</div>
					</div>
				</div>
				<div>
					<p>Report generated on {new Date().toLocaleString()}</p>
				</div>
			</div>
		</div>
	);
};
