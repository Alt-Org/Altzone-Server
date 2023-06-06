import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class FurnitureValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('gameId', Location.BODY).notEmpty().isString().build(),
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('shape', Location.BODY).notEmpty().isString().build(),
        new Validator('weight', Location.BODY).notEmpty().isDouble().build(),
        new Validator('material', Location.BODY).notEmpty().isString().build(),
        new Validator('recycling', Location.BODY).notEmpty().isString().build(),
        new Validator('unityKey', Location.BODY).notEmpty().isString().build(),
        new Validator('filename', Location.BODY).notEmpty().isString().build(),
        new Validator('clanGameId', Location.BODY).notEmpty().isString().build(),

        new Validator('clan_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY).ifProvided().isString().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('shape', Location.BODY).ifProvided().isString().build(),
        new Validator('weight', Location.BODY).ifProvided().isDouble().build(),
        new Validator('material', Location.BODY).ifProvided().isString().build(),
        new Validator('recycling', Location.BODY).ifProvided().isString().build(),
        new Validator('unityKey', Location.BODY).ifProvided().isString().build(),
        new Validator('filename', Location.BODY).ifProvided().isString().build(),
        new Validator('clanGameId', Location.BODY).ifProvided().isString().build(),

        new Validator('clan_id', Location.BODY).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}