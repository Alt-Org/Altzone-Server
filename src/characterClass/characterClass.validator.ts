import { body, param } from 'express-validator';
import { handleValidationError } from "../util/error/errorHandler";

export default class CharacterClassValidator {
    validateCreate = [
        body('name', 'Field name can not be empty').notEmpty({ignore_whitespace: true}),
        body('name', 'Field name must be string').isString(),

        body('mainDefence', 'Field mainDefence can not be empty').notEmpty({ignore_whitespace: true}),
        body('mainDefence', 'Field mainDefence must be string').isString(),

        body('speed', 'Field speed can not be empty').notEmpty({ignore_whitespace: true}),
        body('speed', 'Field speed must be int').isInt(),

        body('resistance', 'Field resistance can not be empty').notEmpty({ignore_whitespace: true}),
        body('resistance', 'Field resistance must be int').isInt(),

        body('attack', 'Field attack can not be empty').notEmpty({ignore_whitespace: true}),
        body('attack', 'Field attack must be int').isInt(),

        body('defence', 'Field defence can not be empty').notEmpty({ignore_whitespace: true}),
        body('defence', 'Field defence must be int').isInt(),

        handleValidationError
    ];

    validateRead = [
        param('id', 'Parameter id must be in Mongo ObjectId form').isMongoId(),
        handleValidationError
    ];

    validateUpdate = [
        body('id', 'Field id can not be empty').notEmpty({ignore_whitespace:true}),
        body('id', 'Field id must be in Mongo ObjectId form').isMongoId(),
        handleValidationError
    ];

    validateDelete = [
        param('id', 'Field id can not be empty').notEmpty({ignore_whitespace:true}),
        param('id', 'Parameter id must be a in Mongo ObjectId form').isMongoId(),
        handleValidationError
    ];
}