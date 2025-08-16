import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { whatsAppController } from './whatsapp.controller';


const router = express.Router();

router.post('/', auth,whatsAppController.createWhatsapp);
router.get('/', auth, whatsAppController.whatsApp);
router.get('/:id', auth, whatsAppController.getWhatsAppById);
router.patch('/:id', auth, whatsAppController.updateWhatsapp);



export default router;
