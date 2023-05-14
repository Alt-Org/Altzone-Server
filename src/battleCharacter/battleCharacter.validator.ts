import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";
import ValidatorAbstract from "../util/baseAPIClasses/validatorAbstract";

export default class BattleCharacterValidator extends ValidatorAbstract {
    validateCreate = [
        new Validator('characterClass_id', Location.BODY, ClassName.BATTLE_CHARACTER).notEmpty().isMongoId().build(),
        new Validator('customCharacter_id', Location.BODY, ClassName.BATTLE_CHARACTER).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, ClassName.BATTLE_CHARACTER).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, ClassName.CHARACTER_CLASS).notEmpty().isMongoId().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.BATTLE_CHARACTER).isMongoId().build(),

        handleValidationError
    ];
}