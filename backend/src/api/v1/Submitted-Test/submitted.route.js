import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { submitTestController } from './submitted.controller';


const router = express.Router();

router.post('/',auth, submitTestController.submitTest);




export default router;
