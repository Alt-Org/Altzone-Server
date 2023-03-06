import {MongooseError} from "mongoose";

const getStatusForMongooseError = (err: unknown): number => {
    if(err instanceof MongooseError){
        if(err.name === 'ValidationError'){
            return 400;
        }
    }

    return 500;
}

export { getStatusForMongooseError }