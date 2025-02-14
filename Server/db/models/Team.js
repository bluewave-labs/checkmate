import mongoose from "mongoose";

const SubscriptionSchema = mongoose.Schema(
	{
		plan: {
			type: String,
			required: true,
			enum: ["free", "basic", "pro", "enterprise"],
			default: "free",
		},
		maxMembers: {
			type: Number,
			required: true,
			default: 5,
		},
	},
	{
		timestamps: true,
	}
);

const TeamSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			default: "My Team",
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		subscription: {
			type: SubscriptionSchema,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
export default mongoose.model("Team", TeamSchema);
