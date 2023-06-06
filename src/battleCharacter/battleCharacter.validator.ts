import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class BattleCharacterValidator implements IValidator{
    public readonly validateCreate = [
        new Validator('characterClass_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('customCharacter_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    public readonly validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    public readonly validateDelete = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];
}