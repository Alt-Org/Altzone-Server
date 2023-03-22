import {handleValidationError} from "../util/response/errorHandler";
import {ValidationChainBuilder as Validator} from "../util/validator/validationChainBuilder";
import {Location} from "../util/validator/location";
import {swapKeysAndValues} from "../util/general/objectUtil";
import {clanDictionary} from "../util/parser/dictionary";

export default class ClanValidator{
    private readonly gameToAPIDictionary: Record<string, string> = swapKeysAndValues(clanDictionary);
    validateCreate = [
        new Validator('gameId', Location.BODY, this.gameToAPIDictionary.gameId).notEmpty().isString().build(),
        new Validator('name', Location.BODY, this.gameToAPIDictionary.name).notEmpty().isString().build(),
        new Validator('tag', Location.BODY, this.gameToAPIDictionary.tag).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY, this.gameToAPIDictionary.gameCoins).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateRead = [
        new Validator('_id', Location.PARAM, this.gameToAPIDictionary._id).isMongoId().build(),

        handleValidationError
    ];

    validateUpdate = [
        new Validator('_id', Location.BODY, this.gameToAPIDictionary._id).notEmpty().isMongoId().build(),
        new Validator('gameId', Location.BODY, this.gameToAPIDictionary.gameId).ifProvided().isString().build(),
        new Validator('name', Location.BODY, this.gameToAPIDictionary.name).ifProvided().isString().build(),
        new Validator('tag', Location.BODY, this.gameToAPIDictionary.tag).ifProvided().isString().build(),
        new Validator('gameCoins', Location.BODY, this.gameToAPIDictionary.gameCoins).ifProvided().isInt().build(),

        handleValidationError
    ];

    validateDelete = [
        new Validator('_id', Location.PARAM, this.gameToAPIDictionary._id).notEmpty().isMongoId().build(),

        handleValidationError
    ];
}