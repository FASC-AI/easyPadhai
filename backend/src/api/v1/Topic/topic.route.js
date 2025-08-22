import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { topicController } from './topic.controller.js';


const router = express.Router();

router.patch('/', auth, topicController.updateLessonTopicStatus);




export default router;
