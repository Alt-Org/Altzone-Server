import {Router} from 'express';
import ClanController from './clan.controller';

const router = Router();
const controller = new ClanController();

router.post('/', controller.create);
router.get('/:id', controller.get);
router.get('/', controller.getAll);
router.put('/', controller.update);
router.delete('/:id', controller.delete);

export default router;