import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { countryController } from './country.controller.js';
import multer from 'multer';
import processExcel from '../../../middlewares/process-excel.middleware.js';

const router = express.Router();
const upload = multer({ dest: 'temp/uploads/' });

router.post(
  '/bulk-upload',
  auth,
  upload.single('file'),
  processExcel,
  countryController.bulkUpload
);
router.post('/', auth, countryController.createCountry);
router.get('/', auth, countryController.getAllCountries);
router.get('/:id', auth, countryController.getCountryById);
router.patch('/:id', auth, countryController.updateCountry);
router.delete('/:id', auth, countryController.deleteCountry);

export default router;
