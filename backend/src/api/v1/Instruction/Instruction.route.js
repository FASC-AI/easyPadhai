import express from 'express';
import auth from '../../../middlewares/auth.middleware';
import { InstructionController } from './Instruction.controller';


const router = express.Router();

router.post('/',auth, InstructionController.createInstruction);
router.get(
  '/instructionbysubclass',
  auth,
  InstructionController.instructionBySubjectClass
);
router.get('/list', auth, InstructionController.getAllInstruction);
router.get('/instructionlist',auth,InstructionController.instructionList)
router.patch('/:id', auth, InstructionController.updateInstruction);

router.get('/:id', auth, InstructionController.getInstructionById);

router.delete('/:id', auth, InstructionController.deleteInstruction);


export default router;
