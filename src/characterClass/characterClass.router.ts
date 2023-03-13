import { Router } from 'express';
import CharacterClassController from './characterClass.controller';
import CharacterClassValidator from './characterClass.validator';

const router = Router();
const controller = new CharacterClassController();
const validator = new CharacterClassValidator();

router.post('/', validator.validateCreate, controller.create);
router.get('/:id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', validator.validateUpdate, controller.update);
router.delete('/:id', validator.validateDelete, controller.delete);

export default router;