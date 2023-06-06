import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class RaidRoomValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('gameId', Location.BODY).notEmpty().isString().build(),
        new Validator('type', Location.BODY).notEmpty().isRaidRoomEnumType().build(),
        new Validator('rowCount', Location.BODY).notEmpty().isInt().build(),
        new Validator('colCount', Location.BODY).notEmpty().isInt().build(),
        new Validator('clanMemberGameId', Location.BODY).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY).notEmpty().isString().build(),

        new Validator('playerData_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('clan_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY).ifProvided().isString().build(),
        new Validator('type', Location.BODY).ifProvided().isRaidRoomEnumType().build(),
        new Validator('rowCount', Location.BODY).ifProvided().isInt().build(),
        new Validator('colCount', Location.BODY).ifProvided().isInt().build(),
        new Validator('clanMemberGameId', Location.BODY).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY).ifProvided().isString().build(),

        new Validator('playerData_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}