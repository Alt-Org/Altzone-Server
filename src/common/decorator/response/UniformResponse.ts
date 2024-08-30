import {applyDecorators, UseFilters, UseInterceptors} from '@nestjs/common';
import { ModelName } from 'src/common/enum/modelName.enum';
import { ValidationExceptionFilter } from '../../errorFilter/ValidationExceptionFilter';
import { FormatAPIResponse } from './FormatAPIResponse';
import { Send204OnEmptyRes } from 'src/common/interceptor/response/Send204OnEmptyRes';

/**
 * Uniform response sent to the client side as follows
 * 
 * - If ServiceError, ServiceError[], APIError or APIError[] is returned or thrown 
 * from/in the controller method. It will sent an appropriate error response
 * - If the controller method does not return a ServiceError or an APIError, 
 * it will be treated as a success and this data will be formatted into {data: ..., metaData: ...} form.
 * - If nothing is returned the response with 204 (No Content) status will be returned
 * @param modelName name of the model, what the controller returning on success
 * @returns 
 */
export function UniformResponse(modelName?: ModelName) {
    const decorators = [
        Send204OnEmptyRes(), 
        UseFilters(new ValidationExceptionFilter()), 
        FormatAPIResponse(modelName)
    ];

    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        decorators.reverse().forEach(decorator => {
            decorator(target, propertyKey, descriptor);
        });
    };
}