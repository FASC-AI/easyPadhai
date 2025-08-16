import express from 'express';
const router = express.Router();
import createResponse from '../../utils/response';
import httpStatus from '../../utils/httpStatus';

import userRoutes from './User/user.route';
import ClassRoutes from './Class/class.route';
import SubjectRoutes from './Subject/subject.route';
import SectionRoutes from './Section/section.route';
import instituteRoutes from './Institution/institution.route';
import countryRoutes from './Country/country.route';
import imageRoutes from '../imageRoutes';
import stateRoutes from './state/state.route';
import districtRoutes from './district/district.route';
import cityRoutes from './city/city.route';
// import profileRoutes from './Profile/profile.route';
import instructionRoutes from './Instruction/Instruction.route';
import userProfile from './User-Profile/userprofile.route';
import lessonRoutes from './Lesson/lesson.route';
import bannerRoutes from './Banner/banner.route';
import uploadRoutes from './upload/upload.route';
import notificationRoutes from './notification/notification.routes';
import batchRoutes from './Batch/batch.route';
import batchRequestRoutes from './BatchRequest/request.routes';
import bookRoutes from './Book/book.route';
import LessonMasterRoutes from './Lesson-master/lessonMaster.route';
import topicRoutes from './Topic/topic.route';
import testRoutes from './Test/test.route';
import homeworkRoutes from './Homework/homework.route';
import lessonTestRoutes from './LessonTest/lesson-test.route';
import studentNotificationRoutes from './StudentNotification/studentnotification.route';
import submitTestRoutes from './Submitted-Test/submitted.route';
import offlineTestRoutes from './Offline-test/offline.route';
import noteRoutes from './Notes/notes.route';
import whatsappRoutes from './Whatsapp/whatsapp.route';
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
