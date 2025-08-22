import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { BannerController } from './banner.controller.js';

const router = express.Router();

router.post('/', auth, BannerController.createBanner);

router.get('/list', auth, BannerController.getAllBanners);

router.patch('/:id', auth, BannerController.updateBanner);

router.get('/:id', auth, BannerController.getBannerById);

router.delete('/:id', auth, BannerController.deleteBanner);

export default router; 