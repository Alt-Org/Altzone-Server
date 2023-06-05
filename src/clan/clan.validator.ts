import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";


export default class ClanValidator implements IValidator{
    validateCreate = [
        new Validator('gameId', Location.BODY).notEmpty().isString().build(),
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('tag', Location.BODY).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY).ifProvided().isInt().build(),

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
        new Validator('tag', Location.BODY).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}