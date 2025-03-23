import {UseFilters, UseInterceptors} from '@nestjs/common';
import {ValidationExceptionFilter} from '../../exceptionFilter/ValidationExceptionFilter';
import {FormatAPIResponseInterceptor} from '../../interceptor/response/FormatAPIResponse';
import {ModelName} from '../../enum/modelName.enum';
import {Send204OnEmptyRes} from '../../interceptor/response/Send204OnEmptyRes';
import {APIErrorFilter} from '../../exceptionFilter/APIErrorFilter';

/**
 * Uniform response sent to the client side as follows
 *
 * - If ServiceError, ServiceError[], APIError or APIError[] is returned or thrown
 * from/in the controller method. It will send an appropriate error response
 * - If the controller method does not return a ServiceError or an APIError,
 * it will be treated as a success and this data will be formatted into {data: ..., metaData: ...} form.
 * - If nothing is returned the response with 204 (No Content) status will be returned
 * @param modelName name of the model, what the controller returning on success
 * @returns
 */
export function UniformResponse(modelName?: ModelName) {
    const decorators = [
        Send204OnEmptyRes(),
        UseFilters(new ValidationExceptionFilter(), new APIErrorFilter()),
        UseInterceptors(new FormatAPIResponseInterceptor(modelName))
    ];

    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        decorators.reverse().forEach(decorator => {
            decorator(target, propertyKey, descriptor);
        });
    };
}
