import mongoose from "mongoose";

const MonitorSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			immutable: true,
			required: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			immutable: true,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		status: {
			type: Boolean,
			default: undefined,
		},
		type: {
			type: String,
			required: true,
			enum: ["http", "ping", "pagespeed", "hardware", "docker", "port"],
		},
		url: {
			type: String,
			required: true,
		},
		port: {
			type: Number,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		interval: {
			// in milliseconds
			type: Number,
			default: 60000,
		},
		uptimePercentage: {
			type: Number,
			default: undefined,
		},
		thresholds: {
			type: {
				usage_cpu: { type: Number },
				usage_memory: { type: Number },
				usage_disk: { type: Number },
			},
			_id: false,
		},
		notifications: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Notification",
			},
		],
		secret: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Monitor", MonitorSchema);
