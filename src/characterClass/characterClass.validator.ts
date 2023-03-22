import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {characterClassDictionary} from "../util/parser/dictionary";
import {swapKeysAndValues} from "../util/general/objectUtil";

export default class CharacterClassValidator {
    private readonly gameToAPIDictionary: Record<string, string> = swapKeysAndValues(characterClassDictionary);

    validateCreate = [
        new Validator('gameId', Location.BODY, this.gameToAPIDictionary.gameId).notEmpty().isInt().build(),
        new Validator('name', Location.BODY, this.gameToAPIDictionary.name).notEmpty().isString().build(),
        new Validator('mainDefence', Location.BODY, this.gameToAPIDictionary.mainDefence).notEmpty().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY, this.gameToAPIDictionary.speed).notEmpty().isInt().build(),
        new Validator('resistance', Location.BODY, this.gameToAPIDictionary.resistance).notEmpty().isInt().build(),
        new Validator('attack', Location.BODY, this.gameToAPIDictionary.attack).notEmpty().isInt().build(),
        new Validator('defence', Location.BODY, this.gameToAPIDictionary.defence).notEmpty().isInt().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, this.gameToAPIDictionary._id).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, this.gameToAPIDictionary._id).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, this.gameToAPIDictionary.gameId).ifProvided().isInt().build(),
        new Validator('name', Location.BODY, this.gameToAPIDictionary.name).ifProvided().isString().build(),
        new Validator('mainDefence', Location.BODY, this.gameToAPIDictionary.mainDefence).ifProvided().isDefenceEnumType().build(),
        new Validator('speed', Location.BODY, this.gameToAPIDictionary.speed).ifProvided().isInt().build(),
        new Validator('resistance', Location.BODY, this.gameToAPIDictionary.resistance).ifProvided().isInt().build(),
        new Validator('attack', Location.BODY, this.gameToAPIDictionary.attack).ifProvided().isInt().build(),
        new Validator('defence', Location.BODY, this.gameToAPIDictionary.defence).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, this.gameToAPIDictionary._id).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}