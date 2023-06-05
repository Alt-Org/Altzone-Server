import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class CustomCharacterValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY).notEmpty().isString().build(),
        new Validator('unityKey', Location.BODY).notEmpty().isString().build(),
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('speed', Location.BODY).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY).notEmpty().isInt().build(),
        new Validator('characterClassGameId', Location.BODY).notEmpty().isString().build(),
        new Validator('playerDataGameId', Location.BODY).notEmpty().isString().build(),

        new Validator('characterClass_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('playerData_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY).ifProvided().isString().build(),
        new Validator('unityKey', Location.BODY).ifProvided().isString().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('speed', Location.BODY).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY).ifProvided().isInt().build(),
        new Validator('characterClassGameId', Location.BODY).ifProvided().isString().build(),
        new Validator('playerDataGameId', Location.BODY).notEmpty().isString().build(),

        new Validator('characterClass_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('playerData_id', Location.BODY).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}