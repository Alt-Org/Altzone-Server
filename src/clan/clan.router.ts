import { Router } from 'express';
import ClanController from './clan.controller';
import ClanValidator from './clan.validator';
import {FieldParserFactory, ParserType} from "../util/parser";

const router = Router();
const controller = new ClanController();
const validator = new ClanValidator();
const parser = new FieldParserFactory().createParser(ParserType.CLAN);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;