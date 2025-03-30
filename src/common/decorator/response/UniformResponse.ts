import { UseFilters, UseInterceptors } from '@nestjs/common';
import { ValidationExceptionFilter } from '../../exceptionFilter/ValidationExceptionFilter';
import { FormatAPIResponseInterceptor } from '../../interceptor/response/FormatAPIResponse';
import { ModelName } from '../../enum/modelName.enum';
import { Send204OnEmptyRes } from '../../interceptor/response/Send204OnEmptyRes';
import { APIErrorFilter } from '../../exceptionFilter/APIErrorFilter';
import { IClass } from '../../interface/IClass';
import { SerializeInterceptor2 } from '../../interceptor/response/SerializeInterceptor2';

/**
 * Uniform response sent to the client side as follows
 *
 * - If ServiceError, ServiceError[], APIError or APIError[] is returned or thrown
 * from/in the controller method. It will send an appropriate error response
 * - If the controller method does not return a ServiceError or an APIError,
 * it will be treated as a success and this data will be formatted into {data: ..., metaData: ...} form.
 * - If nothing is returned the response with 204 (No Content) status will be returned
 * @param modelName name of the model, what the controller returning on success
 * @param serializationShape class, which determines the serialization of the response data, ignored if not specified
 * @returns
 */
export function UniformResponse(
  modelName?: ModelName,
  serializationShape?: IClass,
) {
  const decorators = [
    Send204OnEmptyRes(),
    UseFilters(new ValidationExceptionFilter(), new APIErrorFilter()),
    UseInterceptors(
      new FormatAPIResponseInterceptor(modelName),
      new SerializeInterceptor2(serializationShape),
    ),
  ];

  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    decorators.reverse().forEach((decorator) => {
      decorator(target, propertyKey, descriptor);
    });
  };
}
