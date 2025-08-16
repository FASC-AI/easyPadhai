import { BatchRequestController } from "./request.controller";
import express from 'express';
import auth from '../../../middlewares/auth.middleware';
const router = express.Router();

router.post('/', auth, BatchRequestController.createBatchRequest);
router.get('/requestedbatch', auth, BatchRequestController.requestedBatch);
router.get('/checkjoinedbatch', auth, BatchRequestController.checkJoinedBatch);
router.delete(
  "/removestudent",
  auth,
  BatchRequestController.removeStudentFromBatch
);
router.patch('/:id', auth, BatchRequestController.batchRequestApproval);

export default router;