import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { studentNotificationController } from './studentnotification.controller';
const router = express.Router();

router.get('/notification', auth, studentNotificationController.getAllNotification);
router.get(
  '/notificationcount',
  auth,
  studentNotificationController.getAllNotificationCount
);
router.patch('/readnotification',auth,studentNotificationController.updateNotificationStatus,)
router.get('/lasthomework', auth, studentNotificationController.lastHomework);
router.post('/sendmessage', auth, studentNotificationController.sendMessage);
export default router;
