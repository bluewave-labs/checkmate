import logger from '../utils/logger.js';

class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }

    async triggerNotification(req, res) {
        const { monitorId, type, config } = req.body;
    
        if (!monitorId || !type) {
            return res.status(400).json({ 
                success: false, 
                msg: "monitorId and type are required" 
            });
        }
    
        try {
            const networkResponse = {
                monitor: { _id: monitorId, name: "Test Monitor", url: "http://www.google.com" },
                status: false,
                statusChanged: true,
                prevStatus: true,
            };
    
            if (type === "telegram") {
                if (!config?.botToken || !config?.chatId) {
                    return res.status(400).json({ 
                        success: false, 
                        msg: "botToken and chatId are required for Telegram notifications" 
                    });
                }
                await this.notificationService.sendWebhookNotification(
                    networkResponse, null, type, config.botToken, config.chatId
                );
            } else if (type === "discord" || type === "slack") {
                if (!config?.webhookUrl) {
                    return res.status(400).json({ 
                        success: false, 
                        msg: `webhookUrl is required for ${type} notifications` 
                    });
                }
                await this.notificationService.sendWebhookNotification(
                    networkResponse, config.webhookUrl, type
                );
            } else if (type === "email") {
                if (!config?.address) {
                    return res.status(400).json({ 
                        success: false, 
                        msg: "address is required for email notifications" 
                    });
                }
                await this.notificationService.sendEmail(networkResponse, config.address);
            }
    
            res.json({ success: true, msg: "Notification sent successfully" });
        } catch (error) {
            logger.error({
                message: error.message,
                service: "NotificationController",
                method: "triggerNotification",
                stack: error.stack,
            });
            res.status(500).json({ success: false, msg: "Failed to send notification" });
        }
    }
    
}

export default NotificationController;