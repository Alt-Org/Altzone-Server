import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class CharacterClassValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY).notEmpty().isString().build(),
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('mainDefence', Location.BODY).notEmpty().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY).notEmpty().isInt().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY).ifProvided().isString().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('mainDefence', Location.BODY).ifProvided().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}