import mongoose from "mongoose";

const TeamMemberSchema = mongoose.Schema(
	{
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		role: {
			type: [String],
			enum: {
				values: ["owner", "admin", "member"],
				message: "{VALUE} is not a valid role",
			},
			default: ["member"],
		},
	},
	{
		timestamps: true,
	}
);
export default mongoose.model("TeamMember", TeamMemberSchema);
