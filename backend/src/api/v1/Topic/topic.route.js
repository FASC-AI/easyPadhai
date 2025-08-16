import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { topicController } from './topic.controller';


const router = express.Router();

router.patch('/', auth, topicController.updateLessonTopicStatus);




export default router;
