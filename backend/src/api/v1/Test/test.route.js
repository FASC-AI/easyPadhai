import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { TestController } from './test.controller.js';

const router = express.Router();
router.get('/currenttime', TestController.getISTTime);
router.get('/studentmarkslist', auth, TestController.studentTestMarks);
router.get('/markslist', auth, TestController.studentTestMarksLeaderboard);
router.get('/leaderboard', auth, TestController.studentTestLeaderboard);
router.post('/', auth, TestController.createTest);
router.get('/list', auth, TestController.getAllTest);
router.get('/checktestattempt', auth, TestController.checkAttemptedTest);
router.get('/previoustest', auth, TestController.previousDayTests);
router.get('/testbylessontopic', auth, TestController.getTestsByLessonAndTopic);
router.get('/publishedtestinfo', auth, TestController.getPublishedTest);
router.get('/getcurrentdaytest', auth, TestController.currentDayTest);
router.get('/testbybookinfo', auth, TestController.getTestByBook);
router.get('/userpublishtest', auth, TestController.getUserTestByBook);
router.patch('/publishtest', auth, TestController.publishTest);
router.patch('/republishtest', auth, TestController.republishTest);
router.delete('/deletepublishedtest', auth, TestController.deletePublishedTest);
router.patch('/:id', auth, TestController.updateTest);
router.get('/:id', auth, TestController.getTestById);
router.delete('/:id', auth, TestController.deleteTest);

export default router;
