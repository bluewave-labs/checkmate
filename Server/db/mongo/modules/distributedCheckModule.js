import DistributedUptimeCheck from "../../models/DistributedUptimeCheck.js";
import Monitor from "../../models/Monitor.js";
const SERVICE_NAME = "distributedCheckModule";

const createDistributedCheck = async (checkData) => {
	try {
		const check = await new DistributedUptimeCheck({ ...checkData }).save();
		return check;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "createCheck";
		throw error;
	}
};

const getDistributedMonitors = async (teamId) => {
	try {
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getDistributedMonitors";
		throw error;
	}
};

export { createDistributedCheck, getDistributedMonitors };
