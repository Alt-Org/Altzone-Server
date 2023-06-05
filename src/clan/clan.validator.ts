import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";
import IValidator from "../util/baseAPIClasses/IValidator";


export default class ClanValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY, ClassName.CLAN).notEmpty().isString().build(),
        new Validator('name', Location.BODY, ClassName.CLAN).notEmpty().isString().build(),
        new Validator('tag', Location.BODY, ClassName.CLAN).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY, ClassName.CLAN).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.CLAN).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.CLAN).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, ClassName.CLAN).ifProvided().isString().build(),
        new Validator('name', Location.BODY, ClassName.CLAN).ifProvided().isString().build(),
        new Validator('tag', Location.BODY, ClassName.CLAN).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY, ClassName.CLAN).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.CLAN).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}