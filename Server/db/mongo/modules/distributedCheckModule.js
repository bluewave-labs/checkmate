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

const deleteDistributedChecksByMonitorId = async (monitorId) => {
	try {
		const result = await DistributedUptimeCheck.deleteMany({ monitorId });
		return result.deletedCount;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "deleteDistributedChecksByMonitorId";
		throw error;
	}
};

export { createDistributedCheck, deleteDistributedChecksByMonitorId };
