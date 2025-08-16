import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { profileController } from './userprofile.controller';
const router = express.Router();

router.get('/user-info', auth, profileController.getProfile);
router.post('/addprofilewithinvite', auth, profileController.createProfileWithInvitation);
router.post('/', auth, profileController.createProfile);
router.get('/', auth, profileController.getProfileList);
router.post('/validate-email', auth, profileController.validateEmail);
router.post('/validate-mobile', auth, profileController.validateMobile);
router.get('/students', auth, profileController.getStudentList);
router.get('/teachers', auth, profileController.getTeacherList);
router.get('/teachers/:id', auth, profileController.getTeacherById);
router.get('/students/:id', auth, profileController.getStudentById);
router.get('/:id', auth, profileController.getProfileById);
router.patch('/:id', auth, profileController.updateProfile);
router.patch('/status/:id', auth, profileController.updateProfileStatus);
router.post('/set-pass', auth, profileController.setPassword);
router.post('/add-edit', auth, profileController.createOrUpdateProfile);

export default router;
