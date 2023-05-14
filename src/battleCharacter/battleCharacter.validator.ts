import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {ClassName} from "../util/dictionary";
import ValidatorAbstract from "../util/baseAPIClasses/validatorAbstract";
import { Request, Response, NextFunction } from "express";
import { ValidationChain } from "express-validator";

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

    validateUpdate?: (ValidationChain | ((req: Request<any, any, any, any, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void))[] | undefined;

    validateDelete = [
        new Validator('_id', Location.PARAM, ClassName.BATTLE_CHARACTER).isMongoId().build(),

        handleValidationError
    ];
}