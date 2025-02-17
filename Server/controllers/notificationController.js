class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.triggerNotification = this.triggerNotification.bind(this);
    }

    async triggerNotification(req, res, next) {
        try {
            const { monitorId, type, platform, config } = req.body;
    
            const networkResponse = {
                monitor: { _id: monitorId, name: "Test Monitor", url: "http://www.google.com" },
                status: false,
                statusChanged: true,
                prevStatus: true,
            };
    
            if (type === "webhook") {
                const notification = {
                    type,
                    platform,  
                    config
                };
                
                await this.notificationService.sendWebhookNotification(
                    networkResponse,
                    notification
                );
            }
    
            return res.success({
                msg: "Notification sent successfully"
            });
    
        } catch (error) {
            error.service = "NotificationController";
            error.method = "triggerNotification";
            next(error);
        }
    }
}

export default NotificationController;