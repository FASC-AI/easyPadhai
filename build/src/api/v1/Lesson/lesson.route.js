import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { lessonController } from './lesson.controller.js';
const router = express.Router();
router.post('/', auth, lessonController.createLesson);
router.get('/', auth, lessonController.getLessons);
router.get('/lessonbysubject/:id', auth, lessonController.lessonBySubject);
router.get(
  '/topicbylesson',
  auth,
  lessonController.getLessonBySubjectClassBookTopicId
);
router.get('/topicinfo/:id', auth, lessonController.getTopicInfo);
router.get('/topic', auth, lessonController.getLessonTopic);
router.get('/:id', auth, lessonController.getLessonById);
router.patch("/videolink/:id", auth, lessonController.updateVideoTutorialLink);
router.patch('/:id',auth,lessonController.updateLesson)
router.delete('/:id', auth, lessonController.deleteLesson);

export default router;
