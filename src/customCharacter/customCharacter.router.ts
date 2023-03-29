import {Router} from 'express';
import CustomCharacterController from './customCharacter.controller';
import CustomCharacterValidator from './customCharacter.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new CustomCharacterController();
const validator = new CustomCharacterValidator();
const parser = new FieldParserFactory().createParser(ClassName.CUSTOM_CHARACTER);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;