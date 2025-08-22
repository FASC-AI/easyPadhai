import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { offlineController } from './offline.controller.js';
import { generateTestPDF } from './generateTestPDF.js';

const router = express.Router();

router.post('/generateTestPDF', auth, generateTestPDF);
router.get('/', auth, offlineController.offlineTest);
router.get('/paper', auth, offlineController.paperList);
router.post('/previewtest', auth, generateTestPDF);
router.delete('/:id', auth, offlineController.deletePaper);

export default router;
