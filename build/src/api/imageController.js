import status from 'http-status';
import imageService from '../services/imageService.js';

const uploadImage = async (req, res) => {
  try {
    // Use the multer middleware directly in the route instead of here
    if (!req.file) {
      return res.status(status.BAD_REQUEST).json({
        status: false,
        message: 'No file uploaded',
      });
    }

    const result = await imageService.uploadImageToS3(req.file);

    if (!result.success) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: result.error,
      });
    }

    res.status(status.OK).json({
      status: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
      },
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Upload failed: ${error.message}`,
    });
  }
};

export default {
  uploadImage,
};
