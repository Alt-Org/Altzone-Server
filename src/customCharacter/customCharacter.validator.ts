import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";

export default class CustomCharacterValidator {
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),
        new Validator('unityKey', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isString().build(),
        new Validator('name', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isString().build(),
        new Validator('speed', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),
        new Validator('characterClassGameId', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isInt().build(),

        new Validator('characterClass_id', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.CUSTOM_CHARACTER).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.CUSTOM_CHARACTER).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),
        new Validator('unityKey', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isString().build(),
        new Validator('name', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isString().build(),
        new Validator('speed', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),
        new Validator('characterClassGameId', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isInt().build(),

        new Validator('characterClass_id', Location.BODY, ClassName.CUSTOM_CHARACTER).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.CUSTOM_CHARACTER).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}