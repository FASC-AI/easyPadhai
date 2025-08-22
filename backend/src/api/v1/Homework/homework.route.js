import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { homeworkController } from './homework.controller.js';
const router = express.Router();
router.post('/', auth, homeworkController.createHomework);
router.get('/', auth, homeworkController.getHomeWork);
router.get('/homeworkbyclasssubject', auth, homeworkController.homeworkByClassAndSubject);
router.get(
  '/homeworkbytopic',
  auth,
  homeworkController.getHomeWorkByTopic
);
router.get(
  '/homeworkpublishedbytopic',
  auth,
  homeworkController.topicWisePublishedHomework
);
router.patch('/publishhomework', auth, homeworkController.publishHomeWork);
router.get('/:id', auth, homeworkController.getHomeWorkById);
router.patch('/:id', auth, homeworkController.updateHomeWork);
router.delete('/:id', auth, homeworkController.deleteHomeWork);

export default router;
