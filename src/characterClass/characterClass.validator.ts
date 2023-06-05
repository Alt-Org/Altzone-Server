import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class CharacterClassValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isString().build(),
        new Validator('name', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isString().build(),
        new Validator('mainDefence', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isInt().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.CHARACTER_CLASS).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isString().build(),
        new Validator('name', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isString().build(),
        new Validator('mainDefence', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY, ClassName.CHARACTER_CLASS).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.CHARACTER_CLASS).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}