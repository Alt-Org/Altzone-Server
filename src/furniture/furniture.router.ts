import {Router} from 'express';
import FurnitureController from './furniture.controller';
import FurnitureValidator from './furniture.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new FurnitureController();
const validator = new FurnitureValidator();
const parser = new FieldParserFactory().createParser(ClassName.FURNITURE);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;