import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import IValidator from "../util/baseAPIClasses/IValidator";

export default class BattleCharacterValidator implements IValidator{
    validateCreate = [
        new Validator('characterClass_id', Location.BODY).notEmpty().isMongoId().build(),
        new Validator('customCharacter_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM).isMongoId().build(),

        handleValidationError
    ];
}