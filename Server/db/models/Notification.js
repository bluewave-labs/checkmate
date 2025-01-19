import mongoose from "mongoose";
const NotificationSchema = mongoose.Schema(
	{
		monitorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Monitor",
			immutable: true,
		},
		type: {
			type: String,
			enum: ["email", "sms", "apprise"],
		},
		appriseUrl: {
			type: String,
			validate: {
				validator: function(v) {
					if (this.type !== 'apprise') return true;
					if (!v || v.length > 2048) return false;
					
					// Apprise URL format: scheme://[user:pass@]host[:port]/path
					const appriseUrlRegex = /^[a-zA-Z]+:\/\/([^:\s]+:[^@\s]+@)?[^\s\/:]+(:\d+)?(\/[^\s]*)?$/;
					return appriseUrlRegex.test(v);
				},
				message: 'Invalid Apprise URL: Must be a valid service URL under 2048 characters'
			}
		},
		address: {
			type: String,
		},
		phone: {
			type: String,
		},
		alertThreshold: {
			type: Number,
			default: 5,
		},
		cpuAlertThreshold: {
			type: Number,
			default: function () {
				return this.alertThreshold;
			},
		},
		memoryAlertThreshold: {
			type: Number,
			default: function () {
				return this.alertThreshold;
			},
		},
		diskAlertThreshold: {
			type: Number,
			default: function () {
				return this.alertThreshold;
			},
		},
		tempAlertThreshold: {
			type: Number,
			default: function () {
				return this.alertThreshold;
			},
		},
	},
	{
		timestamps: true,
	}
);

NotificationSchema.pre("save", function (next) {
	if (!this.cpuAlertThreshold || this.isModified("alertThreshold")) {
		this.cpuAlertThreshold = this.alertThreshold;
	}
	if (!this.memoryAlertThreshold || this.isModified("alertThreshold")) {
		this.memoryAlertThreshold = this.alertThreshold;
	}
	if (!this.diskAlertThreshold || this.isModified("alertThreshold")) {
		this.diskAlertThreshold = this.alertThreshold;
	}
	if (!this.tempAlertThreshold || this.isModified("alertThreshold")) {
		this.tempAlertThreshold = this.alertThreshold;
	}
	next();
});

NotificationSchema.pre("findOneAndUpdate", function (next) {
	const update = this.getUpdate();
	if (update.alertThreshold) {
		update.cpuAlertThreshold = update.alertThreshold;
		update.memoryAlertThreshold = update.alertThreshold;
		update.diskAlertThreshold = update.alertThreshold;
		update.tempAlertThreshold = update.alertThreshold;
	}
	next();
});
export default mongoose.model("Notification", NotificationSchema);
