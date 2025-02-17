import express from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';

class NotificationRoutes {
    constructor(notificationController) {
        this.notificationController = notificationController;
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post(
            '/trigger', 
            verifyJWT,
            this.notificationController.triggerNotification
        );
    }

    getRouter() {
        return this.router;
    }
}

export default NotificationRoutes;