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
			enum: ["email", "sms"],
		},
		config: {
			webhookUrl: { type: String }, // For Discord & Slack
			botToken: { type: String }, // For Telegram
			chatId: { type: String }, // For Telegram
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
	if (this.type === "telegram" && (!this.config.botToken || !this.config.chatId)) {
	  return next(new Error("botToken and chatId are required for Telegram notifications"));
	}
	if ((this.type === "discord" || this.type === "slack") && !this.config.webhookUrl) {
	  return next(new Error(`webhookUrl is required for ${this.type} notifications`));
	}
	if (this.type === "email" && !this.config.address) {
	  return next(new Error("address is required for email notifications"));
	}
	next();
  });

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
