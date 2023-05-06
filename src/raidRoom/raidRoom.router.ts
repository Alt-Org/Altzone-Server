import {Router} from 'express';
import RaidRoomController from './raidRoom.controller';
import RaidRoomValidator from './raidRoom.validator';
import {FieldParserFactory} from "../util/parser";
import {ClassName} from "../util/dictionary";

const router = Router();
const controller = new RaidRoomController();
const validator = new RaidRoomValidator();
const parser = new FieldParserFactory().createParser(ClassName.RAID_ROOM);

router.post('/', parser.parseFromGameToAPI, validator.validateCreate, controller.create);
router.get('/:_id', validator.validateRead, controller.get);
router.get('/', controller.getAll);
router.put('/', parser.parseFromGameToAPI, validator.validateUpdate, controller.update);
router.delete('/:_id', validator.validateDelete, controller.delete);

export default router;