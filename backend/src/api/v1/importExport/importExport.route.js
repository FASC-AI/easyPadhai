import express from 'express';
import { uploadCSV, downloadCSV, csvUploadMiddleware } from '../controllers/importExport.controller';

const router = express.Router();

router.post('/upload/:model', csvUploadMiddleware, uploadCSV);
router.get('/download/:model', downloadCSV);

export default router;
