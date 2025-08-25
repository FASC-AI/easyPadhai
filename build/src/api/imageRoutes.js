import express from 'express';
import imageController from './imageController.js';
import imageService from '../services/imageService.js';

const router = express.Router();

// Apply multer middleware directly in the route
router.post(
  '/upload',
  imageService.upload, // This handles the file upload
  imageController.uploadImage
);

export default router;
