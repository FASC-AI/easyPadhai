import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { LessonController } from './lessonMaster.controller.js';

const router = express.Router();

router.post('/', auth, LessonController.createLesson);
router.post('/reorder', auth, LessonController.reorderLessons);
router.get('/lessonlist',auth,LessonController.getLessonBySubjectClassBookId)
router.get('/list', auth, LessonController.getAllLesson);
router.get('/listweb', auth, LessonController.getAllLessonWeb);
router.get('/list/:id', auth, LessonController.getLessonByLessonId);
router.patch('/:id', auth, LessonController.updateLesson);

router.get('/:id', auth, LessonController.getLessonById);

router.delete('/:id', auth, LessonController.deleteLesson);


export default router;
