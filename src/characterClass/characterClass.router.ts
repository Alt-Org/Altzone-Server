import {Router} from 'express';
import CharacterClassController from './characterClass.controller';
import CharacterClassValidator from './characterClass.validator';
import {FieldParserFactory, ParserType} from "../util/parser";

const router = Router();
const controller = new CharacterClassController();
const validator = new CharacterClassValidator();
const parser = new FieldParserFactory().createParser(ParserType.CHARACTER_CLASS);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;