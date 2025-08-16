import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { BookController } from './book.controller';


const router = express.Router();

router.post('/',auth, BookController.createBook);
router.post('/reorder', auth, BookController.reorderBooks);
router.get('/list', auth, BookController.getAllBook);
router.get('/listweb', auth, BookController.getAllBookWeb);
router.patch('/:id', auth, BookController.updateBook);


router.get('/bookbysubject',auth,BookController.getBooksBySubjectId)
router.get('/bookbysub', auth, BookController.getBooksBySubject);
router.get(
  '/bookbysubjectclass',
  auth,
  BookController.getBooksBySubjectClassId
);
router.get('/:id', auth, BookController.getBookById);
router.delete('/:id', auth, BookController.deleteBook);


export default router;
