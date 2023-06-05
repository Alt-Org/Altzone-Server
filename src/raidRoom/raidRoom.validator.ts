import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class RaidRoomValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.RAID_ROOM).notEmpty().isString().build(),
        new Validator('type', Location.BODY, ClassName.RAID_ROOM).notEmpty().isRaidRoomEnumType().build(),
        new Validator('rowCount', Location.BODY, ClassName.RAID_ROOM).notEmpty().isInt().build(),
        new Validator('colCount', Location.BODY, ClassName.RAID_ROOM).notEmpty().isInt().build(),
        new Validator('clanMemberGameId', Location.BODY, ClassName.RAID_ROOM).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY, ClassName.RAID_ROOM).notEmpty().isString().build(),

        new Validator('playerData_id', Location.BODY, ClassName.RAID_ROOM).notEmpty().isMongoId().build(),
        new Validator('clan_id', Location.BODY, ClassName.RAID_ROOM).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.RAID_ROOM).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.RAID_ROOM).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.RAID_ROOM).ifProvided().isString().build(),
        new Validator('type', Location.BODY, ClassName.RAID_ROOM).ifProvided().isRaidRoomEnumType().build(),
        new Validator('rowCount', Location.BODY, ClassName.RAID_ROOM).ifProvided().isInt().build(),
        new Validator('colCount', Location.BODY, ClassName.RAID_ROOM).ifProvided().isInt().build(),
        new Validator('clanMemberGameId', Location.BODY, ClassName.RAID_ROOM).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY, ClassName.RAID_ROOM).ifProvided().isString().build(),

        new Validator('playerData_id', Location.BODY, ClassName.RAID_ROOM).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY, ClassName.RAID_ROOM).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.RAID_ROOM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}