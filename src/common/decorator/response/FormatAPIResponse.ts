import {HttpException} from "@nestjs/common/exceptions/http.exception";
import { isServiceError } from "../../../common/service/basicService/ServiceError";
import { APIError, convertToAPIError, isAPIError } from "../../../common/controller/APIError";
import formatResponse from "../../../common/controller/formatResponse";
import { ModelName } from "../../../common/enum/modelName.enum";

/**
 * Formats the method return value to uniform shape for sending it to client side.
 *
 * Notice that if the returning value is ServiceError or APIError, it will be thrown, and should be caught by appropriate error filter
 *
 * @param modelName name of the model method is returning
 * @returns
 */
export const FormatAPIResponse = (modelName?: ModelName): any => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            try {
                const result = originalMethod.apply(this, args);

                if (result && result instanceof Promise) {
                    return result.then((data) => {
                        if(isServiceError(data) || isAPIError(data))
                            throw data;

                        return data != null ? formatResponse(data, modelName) : data;
                    }).catch((error: any) => {
                        throwAPIError(error);
                    });
                }

                if(isServiceError(result) || isAPIError(result))
                    throw result;

                return result != null ? formatResponse(result, modelName) : result;
            } catch (error) {
                throwAPIError(error);
            }
        };

        return descriptor;
    };
}

/**
 * Converts any error and throws it as a HttpException
 * @param error to be thrown
 */
function throwAPIError(error: any) {
    const resp: {errors: APIError[]} = {errors: []};
    if(Array.isArray(error))
        for(let i=0, l=error.length; i<l; i++)
            resp.errors.push(convertToAPIError(error[i]));
    else
        resp.errors.push(convertToAPIError(error));

    throw new HttpException(resp, resp.errors[0].statusCode);    
}