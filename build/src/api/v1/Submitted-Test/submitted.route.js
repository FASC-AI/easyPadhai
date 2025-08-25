import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { submitTestController } from './submitted.controller.js';


const router = express.Router();

router.post('/',auth, submitTestController.submitTest);




export default router;
