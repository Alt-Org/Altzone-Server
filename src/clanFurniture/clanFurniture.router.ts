import {Router} from 'express';
import ClanFurnitureController from './clanFurniture.controller';
import ClanFurnitureValidator from './clanFurniture.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new ClanFurnitureController();
const validator = new ClanFurnitureValidator();
const parser = new FieldParserFactory().createParser(ClassName.CLAN_FURNITURE);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;