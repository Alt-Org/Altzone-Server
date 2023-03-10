import { Error as MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";

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


    return 500;
}

export { getStatusForMongooseError }