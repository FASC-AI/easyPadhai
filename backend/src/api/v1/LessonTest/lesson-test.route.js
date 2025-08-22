import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { lessonTestController } from './lesson-test.controller.js';
const router = express.Router();
router.post('/', auth, lessonTestController.addLessonTest);


export default router;
