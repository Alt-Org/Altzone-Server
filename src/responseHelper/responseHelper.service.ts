import {Injectable} from "@nestjs/common";
import APIError from "../util/error/apiError";
import {Error as MongooseError} from "mongoose";
import ValidationError from "../util/error/validationError";
import {MongoServerError} from "mongodb";
import RequestError from "../util/error/requestError";
import ServerError from "../util/error/serverError";

@Injectable()
export class ResponseHelperService {
    private prepareErrorForResponse = (err: unknown): APIError[] => {
        if(err instanceof MongooseError){
            if(err.name === 'ValidationError')
                return [new ValidationError(400, err.message)];
        }

        if(err instanceof MongoServerError){
            //Duplicated field(s)
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
}