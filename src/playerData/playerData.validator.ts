import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";

export default class PlayerDataValidator {
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.PLAYER_DATA).notEmpty().isInt().build(),
        new Validator('name', Location.BODY, ClassName.PLAYER_DATA).notEmpty().isString().build(),
        new Validator('backpackCapacity', Location.BODY, ClassName.PLAYER_DATA).notEmpty().isInt().build(),
        new Validator('uniqueIdentifier', Location.BODY, ClassName.PLAYER_DATA).notEmpty().isString().build(),
        new Validator('currentCustomCharacterGameId', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isInt().build(),
        new Validator('clanGameId', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isString().build(),

        new Validator('currentCustomCharacter_id', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isMongoId().build(),
        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.PLAYER_DATA).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isInt().build(),
        new Validator('name', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isString().build(),
        new Validator('backpackCapacity', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isInt().build(),
        new Validator('uniqueIdentifier', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isString().build(),
        new Validator('currentCustomCharacterGameId', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isInt().build(),
        new Validator('clanGameId', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isString().build(),

        new Validator('currentCustomCharacter_id', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY, ClassName.PLAYER_DATA).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.PLAYER_DATA).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}