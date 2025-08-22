import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { stateController } from './state.controller.js';
import multer from 'multer';
import processExcel from '../../../middlewares/process-excel.middleware.js';

const router = express.Router();
const upload = multer({ dest: 'temp/uploads/' });

router.post(
  '/bulk-upload',
  auth,
  upload.single('file'),
  processExcel,
  stateController.bulkUpload
);
router.post('/', auth, stateController.createState);
router.get('/', auth, stateController.getAllStates);
router.get('/:id', auth, stateController.getStateById);
router.patch('/:id', auth, stateController.updateState);
router.delete('/:id', auth, stateController.deleteState);

export default router;
