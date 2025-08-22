import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { InstitutesController } from './institution.controller.js';


const router = express.Router();

router.post('/', InstitutesController.createInstitutes);

router.get('/list', auth, InstitutesController.getAllInstitutes);

router.patch('/:id', auth, InstitutesController.updateInstitutes);

router.get('/:id', auth, InstitutesController.getInstitutesById);

router.delete('/:id', auth, InstitutesController.deleteInstitutes);


export default router;
