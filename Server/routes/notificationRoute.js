import express from 'express';

class NotificationRoutes {
    constructor(notificationController) {
        this.notificationController = notificationController;
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/trigger', this.notificationController.triggerNotification.bind(this.notificationController));
    }

    getRouter() {
        return this.router;
    }
}

export default NotificationRoutes;