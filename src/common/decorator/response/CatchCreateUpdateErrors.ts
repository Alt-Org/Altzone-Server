import {MongoServerError} from "mongodb";
import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    UnprocessableEntityException
} from "@nestjs/common";
import {HttpException} from "@nestjs/common/exceptions/http.exception";

/**
 * @deprecated 
 */
export const CatchCreateUpdateErrors = (): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Save a reference to the original method
        const originalMethod = descriptor.value;

        // Rewrite original method with try/catch wrapper
        descriptor.value = function (...args: any[]) {
            try {
                const result = originalMethod.apply(this, args);

                // Check if method is asynchronous
                if (result && result instanceof Promise) {
                    // Return promise
                    return result.catch((error: any) => {
                        handleError(error);
                    });
                }

                // Return actual result
                return result;
            } catch (error) {
                handleError(error);
            }
        };

        return descriptor;
    };
}

function handleError(error: any) {
    if(error instanceof MongoServerError){
        if(error.name === 'ValidationError')
            throw new BadRequestException(error.message);

        //Duplicated field(s)
        if(error.code === 11000){
            const duplicatedFields = Object.keys(error.keyPattern);
            const errorMessages: string[] = [];
            for(let i=0; i<duplicatedFields.length; i++){
                const field = duplicatedFields[i];
                const message =  `Field '${field}' with value '${error.keyValue[field]}' already exists`;
                errorMessages.push(message);
            }
            throw new ConflictException(errorMessages);
        }
    }

    if(!(error instanceof HttpException))
        throw new InternalServerErrorException({
            message: 'Unexpected error happened',
            error: error,
            statusCode: 500
        });

    throw error;
}