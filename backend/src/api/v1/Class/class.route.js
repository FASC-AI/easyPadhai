import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { ClassController } from './class.controller';

const router = express.Router();

router.post('/', auth, ClassController.createClass);
router.get('/list', auth, ClassController.getAllClass);
router.get('/listweb', auth, ClassController.getAllClassWeb);
router.patch('/:id', auth, ClassController.updateClass);
router.get('/:id', auth, ClassController.getClassById);
router.delete('/:id', auth, ClassController.deleteClass);
router.post('/reorder', auth, ClassController.reorderClasses);

export default router;