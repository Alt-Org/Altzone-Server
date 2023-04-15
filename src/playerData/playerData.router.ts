import {Router} from 'express';
import PlayerDataController from './playerData.controller';
import PlayerDataValidator from './playerData.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new PlayerDataController();
const validator = new PlayerDataValidator();
const parser = new FieldParserFactory().createParser(ClassName.PLAYER_DATA);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;