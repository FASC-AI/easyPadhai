import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { NotificationController } from './notification.controller.js';

const router = express.Router();

// Create a new notification
router.post('/', auth, NotificationController.createNotification);

// Get all notifications
router.get('/list', auth, NotificationController.getAllNotifications);

// Get a single notification by ID
router.get('/:id', auth, NotificationController.getNotificationById);

// Update a notification
router.patch('/:id', auth, NotificationController.updateNotification);

// Delete a notification
router.delete('/:id', auth, NotificationController.deleteNotification);

// Toggle notification status
router.patch('/:id/toggle-status', auth, NotificationController.toggleNotificationStatus);

export default router; 