import { body, param } from 'express-validator';
import { handleValidationError } from "../util/error/errorHandler";

export default class ClanValidator{
    validateCreate = [
        body('name', 'Field name can not be empty').notEmpty({ignore_whitespace: true}),
        handleValidationError
    ];

    validateUpdate = [
        body('name', 'Field id can not be empty').notEmpty({ignore_whitespace:true}),
        handleValidationError
    ];

    validateDelete = [
        param('id', 'Parameter id must be a Mongo ObjectId').isMongoId(),
        handleValidationError
    ];
}