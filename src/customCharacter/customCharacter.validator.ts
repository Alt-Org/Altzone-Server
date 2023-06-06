import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class CustomCharacterValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('unityKey', Location.BODY).notEmpty().isString().build(),
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('speed', Location.BODY).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY).notEmpty().isInt().build(),

        new Validator('characterClass_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('playerData_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('unityKey', Location.BODY).ifProvided().isString().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('speed', Location.BODY).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY).ifProvided().isInt().build(),

        new Validator('characterClass_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('playerData_id', Location.BODY).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}