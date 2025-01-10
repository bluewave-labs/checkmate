import mongoose from "mongoose";
import { BaseCheckSchema } from "./Check.js";

const DistributedUptimeCheckSchema = mongoose.Schema(
	{
		...BaseCheckSchema.obj,
	},
	{ timestamps: true }
);

DistributedUptimeCheckSchema.index({ createdAt: 1 });
DistributedUptimeCheckSchema.index({ monitorId: 1, createdAt: 1 });
DistributedUptimeCheckSchema.index({ monitorId: 1, createdAt: -1 });

export default mongoose.model("DistributedUptimeCheck", DistributedUptimeCheckSchema);
