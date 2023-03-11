import { Error as MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import RequestError from "./RequestError";
import {NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const getStatusForMongooseError = (err: unknown): number => {
    if(err instanceof MongooseError){
        if(err.name === 'ValidationError'){
            return 400;
        }
    }

    if(err instanceof MongoServerError){
        if(err.code === 11000){
            err.codeName = 'MongoServerError';
            err.message = 'Duplicate key value'
            return 400;
        }
    }

    if(err instanceof RequestError)
        return err.statusCode;


    return 500;
}

const handleValidationError = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json(errors);
        return;
    }

    next();
}

export { getStatusForMongooseError, handleValidationError }