import {handleValidationError} from "../util/error/errorHandler";
import ValidationChainGenerator from "../util/validator/validationChainGenerator";
import {Location} from "../util/validator/location";

export default class CharacterClassValidator {
    validateCreate = [
        new ValidationChainGenerator('name', Location.BODY).notEmpty().isString().generate(),
        new ValidationChainGenerator('mainDefence', Location.BODY).notEmpty().isString().generate(),
        new ValidationChainGenerator('speed', Location.BODY).notEmpty().isInt().generate(),
        new ValidationChainGenerator('resistance', Location.BODY).notEmpty().isInt().generate(),
        new ValidationChainGenerator('attack', Location.BODY).notEmpty().isInt().generate(),
        new ValidationChainGenerator('defence', Location.BODY).notEmpty().isInt().generate(),

        handleValidationError
    ];

    validateRead = [
        new ValidationChainGenerator('id', Location.PARAM).isMongoId().generate(),

        handleValidationError
    ];

    validateUpdate = [
        new ValidationChainGenerator('id', Location.BODY).notEmpty().isMongoId().generate(),
        new ValidationChainGenerator('name', Location.BODY).ifProvided().isString().generate(),
        new ValidationChainGenerator('mainDefence', Location.BODY).ifProvided().isString().generate(),
        new ValidationChainGenerator('speed', Location.BODY).ifProvided().isInt().generate(),
        new ValidationChainGenerator('resistance', Location.BODY).ifProvided().isInt().generate(),
        new ValidationChainGenerator('attack', Location.BODY).ifProvided().isInt().generate(),
        new ValidationChainGenerator('defence', Location.BODY).ifProvided().isInt().generate(),

        handleValidationError
    ];

    validateDelete = [
        new ValidationChainGenerator('id', Location.PARAM).notEmpty().isMongoId().generate(),

        handleValidationError
    ];
}