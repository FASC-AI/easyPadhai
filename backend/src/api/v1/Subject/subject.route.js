import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { SubjectController } from './subject.controller';


const router = express.Router();

router.post('/', SubjectController.createSubject);

router.get('/list', auth, SubjectController.getAllSubject);
router.get('/listweb', auth, SubjectController.getAllSubjectWeb);
router.patch('/:id', auth, SubjectController.updateSubject);

router.get('/:id', auth, SubjectController.getSubjectById);

router.delete('/:id', auth, SubjectController.deleteSubject);
router.post('/reorder', auth, SubjectController.reorderSubject);


export default router;
