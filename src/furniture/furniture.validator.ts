import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";

export default class FurnitureValidator {
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('name', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('shape', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('weight', Location.BODY, ClassName.FURNITURE).notEmpty().isDouble().build(),
        new Validator('material', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('recycling', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('unityKey', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('filename', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),
        new Validator('clanGameId', Location.BODY, ClassName.FURNITURE).notEmpty().isString().build(),

        new Validator('clan_id', Location.BODY, ClassName.FURNITURE).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.FURNITURE).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.FURNITURE).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('name', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('shape', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('weight', Location.BODY, ClassName.FURNITURE).ifProvided().isDouble().build(),
        new Validator('material', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('recycling', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('unityKey', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('filename', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY, ClassName.FURNITURE).ifProvided().isString().build(),

        new Validator('clan_id', Location.BODY, ClassName.FURNITURE).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.FURNITURE).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}