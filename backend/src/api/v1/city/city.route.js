import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { CityController } from './city.controller.js';
import multer from 'multer';
import processExcel from '../../../middlewares/process-excel.middleware.js';

const router = express.Router();
const upload = multer({ dest: 'temp/uploads/' });
router.get(
  '/citybystate/:id',
  auth,
  CityController.getCitysByState
);
router.post(
  '/bulk-upload',
  auth,
  upload.single('file'),
  processExcel,
  CityController.bulkUpload
);


router.post('/', auth, CityController.createCity);
router.get('/', auth, CityController.getAllCitys);
router.get('/:id', auth, CityController.getCityById);
router.patch('/:id', auth, CityController.updateCity);
router.delete('/:id', auth, CityController.deleteCity);
export default router;
