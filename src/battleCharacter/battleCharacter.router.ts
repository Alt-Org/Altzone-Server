import {Router} from 'express';
import BattleCharacterController from './battleCharacter.controller';
import BattleCharacterValidator from './battleCharacter.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new BattleCharacterController();
const validator = new BattleCharacterValidator();
const parser = new FieldParserFactory().createParser(ClassName.BATTLE_CHARACTER);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;