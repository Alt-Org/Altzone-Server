import { Router } from 'express';
import ClanController from './clan.controller';
import ClanValidator from './clan.validator';

const router = Router();
const controller = new ClanController();
const validator = new ClanValidator();

router.post('/', validator.validateCreate, controller.create);
router.get('/:id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', validator.validateUpdate, controller.update);
router.delete('/:id', validator.validateDelete, controller.delete);

export default router;