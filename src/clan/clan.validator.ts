import { body, param } from 'express-validator';
import { handleValidationError } from "../util/error/errorHandler";

export default class ClanValidator{
    validateCreate = [
        body('name', 'Field name can not be empty').notEmpty({ignore_whitespace: true}),
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
        param('id', 'Parameter id must be a in Mongo ObjectId form').isMongoId(),
        handleValidationError
    ];
}