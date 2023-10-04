import {BadRequestException, NotFoundException} from "@nestjs/common";
import {ResponseType} from "./responseType";
import {ModelName} from "../../enum/modelName.enum";
import {IResponseShape} from "../../interface/IResponseShape";

type ResponseHandler = (data: any, modelName: ModelName) => any;

export const ThrowResponseErrorIfFound = (responseType: ResponseType, modelName: ModelName): any => {
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

function handleGetResponse (data: any, modelName: ModelName) {
    if(data == null)
        throw new NotFoundException(`Can not find ${modelName} with that query`);

    const parsedData = data as IResponseShape;

    if(!parsedData || parsedData.metaData?.dataCount === 0)
        throw new NotFoundException(`Can not find any ${modelName} instances`);

    return data;
}

function handleUpdateResponse (data: any, modelName: ModelName){
    if(data instanceof Object && data.matchedCount === 0)
        throw new NotFoundException(`No ${modelName} with that query found`);
    if(data instanceof Object && data.modifiedCount === 0)
        throw new BadRequestException('Nothing to update');
    if(typeof data === 'boolean' && !data)
        throw new BadRequestException(`Can not update ${modelName}`);

    return;
}

function handleDeleteResponse(data: any, modelName: ModelName){
    if(data == null || (data instanceof Object && data.deletedCount != null && data.deletedCount === 0))
        throw new NotFoundException(`Can not find ${modelName} with that query`);

    return;
}