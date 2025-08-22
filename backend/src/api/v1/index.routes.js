import express from 'express';
const router = express.Router();
import createResponse from '../../utils/response.js';
import httpStatus from '../../utils/httpStatus.js';

import userRoutes from './User/user.route.js';
import ClassRoutes from './Class/class.route.js';
import SubjectRoutes from './Subject/subject.route.js';
import SectionRoutes from './Section/section.route.js';
import instituteRoutes from './Institution/institution.route.js';
import countryRoutes from './Country/country.route.js';
import imageRoutes from '../imageRoutes.js';
import stateRoutes from './state/state.route.js';
import districtRoutes from './district/district.route.js';
import cityRoutes from './city/city.route.js';
// import profileRoutes from './Profile/profile.route.js';
import instructionRoutes from './Instruction/Instruction.route.js';
import userProfile from './User-Profile/userprofile.route.js';
import lessonRoutes from './Lesson/lesson.route.js';
import bannerRoutes from './Banner/banner.route.js';
import uploadRoutes from './upload/upload.route.js';
import notificationRoutes from './notification/notification.routes.js';
import batchRoutes from './Batch/batch.route.js';
import batchRequestRoutes from './BatchRequest/request.routes.js';
import bookRoutes from './Book/book.route.js';
import LessonMasterRoutes from './Lesson-master/lessonMaster.route.js';
import topicRoutes from './Topic/topic.route.js';
import testRoutes from './Test/test.route.js';
import homeworkRoutes from './Homework/homework.route.js';
import lessonTestRoutes from './LessonTest/lesson-test.route.js';
import studentNotificationRoutes from './StudentNotification/studentnotification.route.js';
import submitTestRoutes from './Submitted-Test/submitted.route.js';
import offlineTestRoutes from './Offline-test/offline.route.js';
import noteRoutes from './Notes/notes.route.js';
import whatsappRoutes from './Whatsapp/whatsapp.route.js';
// all v1 routes
router.use('/auth', userRoutes);
router.use('/class', ClassRoutes);
router.use('/subject', SubjectRoutes);
router.use('/section', SectionRoutes);
router.use('/institutes', instituteRoutes);
router.use('/country', countryRoutes);
router.use('/district', districtRoutes);
router.use('/city', cityRoutes);
router.use('/state', stateRoutes);
// router.use('/profile', profileRoutes);
router.use('/instruction', instructionRoutes);
router.use('/user-profile', userProfile);
router.use('/lesson', lessonRoutes);
router.use('/banner', bannerRoutes);
router.use('/upload', uploadRoutes);
router.use('/notification', notificationRoutes);
router.use('/batch', batchRoutes);
router.use('/request', batchRequestRoutes);
router.use('/book', bookRoutes);
router.use('/image', imageRoutes);
router.use('/lesson-master', LessonMasterRoutes);
router.use('/topic', topicRoutes);
router.use('/test', testRoutes);
router.use('/homework', homeworkRoutes);
router.use('/studentnotification', studentNotificationRoutes);
router.use('/submittest', submitTestRoutes);
router.use('/offlinetest', offlineTestRoutes);
router.use('/lessontest', lessonTestRoutes);
router.use('/notes', noteRoutes);
router.use('/whatsapp', whatsappRoutes);
/**
 * Middleware to handle 404 Not Found.
 */
router.use((req, res) => {
  createResponse({
    res,
    statusCode: httpStatus.NOT_FOUND,
    message: 'API endpoint not found',
  });
});

export default router;
