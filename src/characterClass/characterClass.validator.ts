import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class CharacterClassValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('gestaltCycle', Location.BODY).notEmpty().isGestaltCycleEnum().build(),
        new Validator('speed', Location.BODY).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY).notEmpty().isInt().build(),

        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('gestaltCycle', Location.BODY).ifProvided().isGestaltCycleEnum().build(),
        new Validator('speed', Location.BODY).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY).ifProvided().isInt().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}