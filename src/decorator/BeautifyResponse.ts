import {BadRequestException, NotFoundException} from "@nestjs/common";
import {ResponseType} from "./responseType";
import {ClassName} from "../util/dictionary";

type ResponseHandler = (data: any, modelName: ClassName) => any;

export const BeautifyResponse = (responseType: ResponseType, modelName: ClassName): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Save a reference to the original method
        const originalMethod = descriptor.value;
        const handler = getResponseHandler(responseType);

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            // Check if method is asynchronous
            if (result && result instanceof Promise) {
                return result.then( (data) => handler(data, modelName) );
            }

            return handler(result, modelName);
        };

        return descriptor;
    };
};

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

function handleGetResponse (data: any, modelName: ClassName) {
    if(data instanceof Array && data.length === 0)
        throw new NotFoundException(`Can not find any ${modelName} instances`);
    if(data == null)
        throw new NotFoundException(`Can not find ${modelName} with that query`);

    return data;
}

function handleUpdateResponse (data: any, modelName: ClassName){
    if(data instanceof Object && data.matchedCount === 0)
        throw new NotFoundException(`No ${modelName} with that query found`);
    if(data instanceof Object && data.modifiedCount === 0)
        throw new BadRequestException('Nothing to update');

    return;
}

function handleDeleteResponse(data: any, modelName: ClassName){
    if(data == null || (data instanceof Object && data.deletedCount != null && data.deletedCount === 0))
        throw new NotFoundException(`Can not find ${modelName} with that query`);

    return;
}