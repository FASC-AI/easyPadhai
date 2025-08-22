import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// File upload endpoint
router.post('/upload', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'No file uploaded'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      status: true,
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

export default router; 