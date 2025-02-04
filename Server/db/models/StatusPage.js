import mongoose from "mongoose";

const StatusPageSchema = mongoose.Schema(
	{
		companyName: {
			type: String,
			required: true,
			default: "",
		},
		url: {
			type: String,
			unique: true,
			required: true,
			default: "",
		},
		timezone: {
			type: String,
			required: true,
			default: "America/Toronto",
		},
		color: {
			type: String,
			required: true,
			default: "#4169E1",
		},
		monitors: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Monitor",
				required: true,
			},
		],
		logo: {
			data: Buffer,
			contentType: String,
		},
		isPublished: {
			type: Boolean,
			default: false,
		},
		showCharts: {
			type: Boolean,
			default: true,
		},
		showUptimePercentage: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("StatusPage", StatusPageSchema);
