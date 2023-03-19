import { Router } from 'express';
import CustomCharacterController from './customCharacter.controller';
import CustomCharacterValidator from './customCharacter.validator';

const router = Router();
const controller = new CustomCharacterController();
const validator = new CustomCharacterValidator();

router.post('/', validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;