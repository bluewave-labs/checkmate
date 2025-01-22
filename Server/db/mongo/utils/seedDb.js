import Monitor from "../../models/Monitor.js";
import Check from "../../models/Check.js";
import { ObjectId } from "mongodb";
const FAKE_TEAM_ID = "67034bceb4c4ea3e8f75fa93";
const FAKE_USER_ID = "67034bceb4c4ea3e8f75fa95";

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
			teamId: FAKE_TEAM_ID,
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
		console.log("Deleting all monitors and checks");
		await Monitor.deleteMany({});
		await Check.deleteMany({});
		console.log("Adding monitors");
		for (let i = 0; i < 300; i++) {
			const monitor = await Monitor.create({
				name: `Monitor ${i}`,
				url: generateRandomUrl(),
				type: "http",
				userId: FAKE_USER_ID,
				teamId: FAKE_TEAM_ID,
				interval: 60000,
				active: true,
			});
			console.log(`Adding monitor and checks for monitor ${i}`);
			const checks = generateChecks(monitor._id, 10000);
			await Check.insertMany(checks);
		}
	} catch (error) {
		console.error(error);
	}
};

export default seedDb;
