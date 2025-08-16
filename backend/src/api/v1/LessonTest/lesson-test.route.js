import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { lessonTestController } from './lesson-test.controller';
const router = express.Router();
router.post('/', auth, lessonTestController.addLessonTest);


export default router;
