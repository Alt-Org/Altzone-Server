import {MongoServerError} from "mongodb";
import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    UnprocessableEntityException
} from "@nestjs/common";
import {HttpException} from "@nestjs/common/exceptions/http.exception";
import { isServiceError } from "src/common/service/basicService/ServiceError";
import { APIError, convertToAPIError, isAPIError } from "src/common/controller/APIError";
import formatResponse from "src/common/controller/formatResponse";
import { ModelName } from "src/common/enum/modelName.enum";

export const FormatAPIResponse = (modelName: ModelName): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            try {
                const result = originalMethod.apply(this, args);

                if (result && result instanceof Promise) {
                    return result.then((data) => {
                        if(isServiceError(data) || isAPIError(data))
                            throw data;

                        return formatResponse(result, modelName);
                    }).catch((error: any) => {
                        throwAPIError(error);
                    });
                }

                if(isServiceError(result) || isAPIError(result))
                    throw result;

                return formatResponse(result, modelName);
            } catch (error) {
                throwAPIError(error);
            }
        };

        return descriptor;
    };
}

function throwAPIError(error: any) {
    const resp: {errors: APIError[]} = {errors: []};
    if(Array.isArray(error))
        for(let i=0, l=error.length; i<l; i++)
            resp.errors.push(convertToAPIError(error[i]));
    else
        resp.errors.push(convertToAPIError(error));

    throw new HttpException(resp, resp.errors[0].status);    
}