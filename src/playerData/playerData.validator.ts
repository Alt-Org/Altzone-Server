import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class PlayerDataValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('name', Location.BODY).notEmpty().isString().build(),
        new Validator('backpackCapacity', Location.BODY).notEmpty().isInt().build(),
        new Validator('uniqueIdentifier', Location.BODY).notEmpty().isString().build(),

        new Validator('currentCustomCharacter_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('raidRoom_id', Location.BODY).ifProvided().isMongoId().build(),
        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('name', Location.BODY).ifProvided().isString().build(),
        new Validator('backpackCapacity', Location.BODY).ifProvided().isInt().build(),
        new Validator('uniqueIdentifier', Location.BODY).ifProvided().isString().build(),

        new Validator('currentCustomCharacter_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('clan_id', Location.BODY).ifProvided().isMongoId().build(),
        new Validator('raidRoom_id', Location.BODY).ifProvided().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}