import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { offlineController } from './offline.controller';
import { generateTestPDF } from './generateTestPDF';

const router = express.Router();

router.post('/generateTestPDF', generateTestPDF);
router.get('/', auth, offlineController.offlineTest);
router.get('/paper', auth, offlineController.paperList);
router.post('/previewtest', auth, generateTestPDF);
router.delete('/:id', auth, offlineController.deletePaper);

export default router;
