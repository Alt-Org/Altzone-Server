import {Router} from 'express';
import CharacterClassController from './characterClass.controller';
import CharacterClassValidator from './characterClass.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new CharacterClassController();
const validator = new CharacterClassValidator();
const parser = new FieldParserFactory().createParser(ClassName.CHARACTER_CLASS);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;