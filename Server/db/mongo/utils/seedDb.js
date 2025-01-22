import Monitor from "../models/Monitor";
import Check from "../models/Check";

const generateRandomUrl = () => {
	const domains = ["example.com", "test.org", "demo.net", "sample.io", "mock.dev"];
	const paths = ["api", "status", "health", "ping", "check"];
	return `https://${domains[Math.floor(Math.random() * domains.length)]}/${paths[Math.floor(Math.random() * paths.length)]}`;
};

const generateChecks = (monitorId, count) => {
	const checks = [];
	const endTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
	const startTime = new Date(endTime - count * 60 * 1000); // count minutes before endTime

	for (let i = 0; i < count; i++) {
		const timestamp = new Date(startTime.getTime() + i * 60 * 1000);
		const status = Math.random() > 0.05; // 95% chance of being up

		checks.push({
			monitorId,
			status,
			responseTime: Math.floor(Math.random() * 1000), // Random response time between 0-1000ms
			createdAt: timestamp,
			updatedAt: timestamp,
		});
	}

	return checks;
};

const seedDb = async () => {
	try {
		await Monitor.deleteMany({});
		await Check.deleteMany({});
	} catch (error) {
		console.error(error);
	}

	for (let i = 0; i < 300; i++) {
		const monitor = await Monitor.create({});
	}
};
