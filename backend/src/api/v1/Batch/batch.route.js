import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { BatchController } from './batch.controller';
const router = express.Router();

router.post('/',auth, BatchController.createBatch);
router.get("/batchstudentlist",auth, BatchController.batchStudentList);
router.get('/list', auth, BatchController.getAllBatch);
router.get('/',auth,BatchController.getBatchById)
router.post('/info', auth, BatchController.getBatchInfo);
export default router;
