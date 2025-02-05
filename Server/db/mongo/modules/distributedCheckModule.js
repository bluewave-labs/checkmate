import DistributedUptimeCheck from "../../models/DistributedUptimeCheck.js";
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

export { createDistributedCheck };
