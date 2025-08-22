import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { DistrictController } from './district.controller.js';
import multer from 'multer';
import processExcel from '../../../middlewares/process-excel.middleware.js';

const router = express.Router();
const upload = multer({ dest: 'temp/uploads/' });
router.get(
  '/districtbystate/:id',
  auth,
  DistrictController.getDistrictsByState
);
router.post(
  '/bulk-upload',
  auth,
  upload.single('file'),
  processExcel,
  DistrictController.bulkUpload
);


router.post('/', auth, DistrictController.createDistrict);
router.get('/', auth, DistrictController.getAllDistricts);
router.get('/:id', auth, DistrictController.getDistrictById);
router.patch('/:id', auth, DistrictController.updateDistrict);
router.delete('/:id', auth, DistrictController.deleteDistrict);
export default router;
