import express from 'express';
import auth from '../../../middlewares/auth.middleware.js';
import { SectionController } from './section.controller.js';


const router = express.Router();

router.post('/', SectionController.createSection);

router.get('/list', auth, SectionController.getAllSection);
router.get('/listweb', auth, SectionController.getAllSectionWeb);
router.patch('/:id', auth, SectionController.updateSection);

router.get('/:id', auth, SectionController.getSectionById);

router.delete('/:id', auth, SectionController.deleteSection);
router.post('/reorder', auth, SectionController.reorderSection
);

export default router;
