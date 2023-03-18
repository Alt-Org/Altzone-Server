import { Error as MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import RequestError from "../error/requestError";
import {NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import APIError from "../error/apiError";
import ServerError from "../error/serverError";
import ValidationError from "../error/validationError";

const sendErrorsToClient = (err: unknown, res: Response) => {
    const errors = prepareErrorForResponse(err);
    const statusCode = errors[0].statusCode;
    res.status(statusCode).json({errors});
}

const handleValidationError = (req: Request, res: Response, next: NextFunction) => {
    const errorsResult = validationResult(req);
    if(!errorsResult.isEmpty()){
        const validationErrors = errorsResult.array();
        const errors: APIError[] = [];

        for(let i=0; i<validationErrors.length; i++){
            const error = validationErrors[i];
            errors.push(new ValidationError(400, error.msg));
        }

        res.status(400).json({errors});
        return;
    }

    next();
}

const prepareErrorForResponse = (err: unknown): APIError[] => {
    if(err instanceof MongooseError){
        if(err.name === 'ValidationError')
            return [new ValidationError(400, err.message)];
    }

    if(err instanceof MongoServerError){
        if(err.code === 11000){
            const duplicatedFields = Object.keys(err.keyPattern);
            const errors: APIError[] = [];
            for(let i=0; i<duplicatedFields.length; i++){
                const field = duplicatedFields[i];
                const error = new RequestError(422, `Field ${field} with value ${err.keyValue[field]} already exists`);
                errors.push(error);
            }

            return errors;
        }
    }

    if(err instanceof APIError)
        return [err];

    return [new ServerError(500, 'Unexpected error happened', err)];
}

export { sendErrorsToClient, handleValidationError }