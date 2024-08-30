import {BadRequestException, NotFoundException} from "@nestjs/common";
import {ResponseType} from "./responseType";
import {ModelName} from "../../enum/modelName.enum";
import {IResponseShape} from "../../interface/IResponseShape";
import {APIObjectName} from "../../enum/apiObjectName.enum";
import { APIError } from "../../controller/APIError";
import { APIErrorReason } from "../../controller/APIErrorReason";

type ResponseHandler = (data: any, modelName: ModelName | APIObjectName) => any;

/**
 * @deprecated 
 */
export const ThrowResponseErrorIfFound = (responseType: ResponseType, modelName: ModelName | APIObjectName): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Save a reference to the original method
        const originalMethod = descriptor.value;
        const handler = getResponseHandler(responseType);

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            // Check if method is asynchronous
            if (result && result instanceof Promise) {
                return result.then( (data) => {
                    return handler(data, modelName);
                });
            }

            return handler(result, modelName);
        }

        return descriptor;
    }
}

function getResponseHandler(responseType: ResponseType): ResponseHandler {
    switch (responseType) {
        case ResponseType.READ:
            return handleGetResponse;
        case ResponseType.UPDATE:
            return handleUpdateResponse;
        case ResponseType.DELETE:
            return handleDeleteResponse;
    }
}

function handleGetResponse (data: any, modelName: ModelName | APIObjectName) {
    const errorResp = {
        statusCode: 404,
        error: 'Not Found'
    }
    if(data == null)
        throw new NotFoundException({...errorResp,
            message: `Can not find ${modelName} with that query`,
            errors: [ new APIError({
                reason: APIErrorReason.NOT_FOUND,
                message: `Can not find ${modelName} with that query`
            }) ]
        });

    const parsedData = data as IResponseShape;

    if(!parsedData || parsedData.metaData?.dataCount === 0)
        throw new NotFoundException({...errorResp,
            message: `Can not find any ${modelName} instances`,
            errors: [ new APIError({
                reason: APIErrorReason.NOT_FOUND,
                message: `Can not find any ${modelName} instances`
            }) ]
        });

    return data;
}

function handleUpdateResponse (data: any, modelName: ModelName | APIObjectName){
    const notFoundErrorResp = {
        statusCode: 404,
        error: 'Not Found'
    }
    if(data instanceof Object && data.matchedCount === 0)
        throw new NotFoundException({...notFoundErrorResp,
            message: `No ${modelName} with that query found`,
            errors: [ new APIError({
                reason: APIErrorReason.NOT_FOUND,
                message: `No ${modelName} with that query found`
            }) ]
        });

    if(data instanceof Object && data.modifiedCount === 0)
        throw new BadRequestException({
            message: 'Nothing to update',
            errors: [ new APIError({
                reason: APIErrorReason.BAD_REQUEST, 
                message: 'Nothing to update'}
            ) ],

            statusCode: 400,
            error: 'Bad Request'
        });

    if(typeof data === 'boolean' && !data)
        throw new BadRequestException({
            message: `Can not update ${modelName}`,
            errors: [ new APIError({
                reason: APIErrorReason.BAD_REQUEST, 
                message: `Can not update ${modelName}`}
            ) ],

            statusCode: 400,
            error: 'Bad Request'
        });

    return;
}

function handleDeleteResponse(data: any, modelName: ModelName | APIObjectName){
    if(data == null || (data instanceof Object && data.deletedCount != null && data.deletedCount === 0))
        throw new NotFoundException({
            message: `Can not find ${modelName} with that query`,
            errors: [ new APIError({
                reason: APIErrorReason.NOT_FOUND,
                message: `Can not find ${modelName} with that query`
            }) ],

            statusCode: 404,
            error: 'Not Found'
        });

    return;
}