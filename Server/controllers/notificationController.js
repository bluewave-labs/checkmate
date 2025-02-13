import logger from '../utils/logger.js';

class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }

    async triggerNotification(req, res) {
        try {
            const { monitorId, type, config } = req.body;
    
            const networkResponse = {
                monitor: { _id: monitorId, name: "Test Monitor", url: "http://www.google.com" },
                status: false,
                statusChanged: true,
                prevStatus: true,
            };

            if (type === "webhook") {
                await this.notificationService.sendWebhookNotification(
                    networkResponse,
                    config
                );
            }

            return res.success({
                msg: "Notification sent successfully"
            });

        } catch (error) {
            logger.error({
                message: error.message,
                service: "NotificationController",
                method: "triggerNotification",
                stack: error.stack,
            });

            return res.error({
                msg: "Failed to send notification"
            });
        }
    }
}

export default NotificationController;