import {
    triggerNotificationBodyValidation,
} from '../validation/joi.js';
import { handleError, handleValidationError } from './controllerUtils.js';

const SERVICE_NAME = "NotificationController";

class NotificationController {
    constructor(notificationService, stringService) {
        this.notificationService = notificationService;
        this.stringService = stringService;
        this.triggerNotification = this.triggerNotification.bind(this);
    }

    async triggerNotification(req, res, next) {
        try {
            await triggerNotificationBodyValidation.validateAsync(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
        } catch (error) {
            next(handleValidationError(error, SERVICE_NAME));
            return;
        }
    
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
                msg: this.stringService.webhookSendSuccess
            });
    
        } catch (error) {
            next(handleError(error, SERVICE_NAME, "triggerNotification"));
        }
    }
}

export default NotificationController;