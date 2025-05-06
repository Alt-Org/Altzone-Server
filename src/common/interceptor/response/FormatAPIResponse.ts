import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { isServiceError } from '../../service/basicService/ServiceError';
import {
  APIError,
  convertToAPIError,
  isAPIError,
} from '../../controller/APIError';
import formatResponse from '../../controller/formatResponse';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Error } from 'mongoose';
import { convertMongooseToServiceErrors } from '../../service/basicService/BasicService';

/**
 * Formats the method return value to uniform shape for sending it to client side.
 *
 * Notice that if the returning value is ServiceError or APIError, it will be thrown, and should be caught by appropriate error filter
 *
 * @param modelName name of the model method is returning
 * @returns
 */
@Injectable()
export class FormatAPIResponseInterceptor implements NestInterceptor {
  constructor(private readonly modelName?: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (returnValue) => {
        try {
          const result = await returnValue;

          if (
            !result ||
            (Array.isArray(result) &&
              result.length === 2 &&
              result[0] === null &&
              result[1] === null)
          )
            return null;

          if (
            Array.isArray(result) &&
            result.length === 2 &&
            result[1] === null
          ) {
            const data = result[0];
            return formatResponse(data, this.modelName);
          }

          if (
            Array.isArray(result) &&
            result.length === 2 &&
            result[0] === null
          ) {
            throw result[1];
          }

          if (isServiceError(result) || isAPIError(result)) {
            throw result;
          }

          return result != null
            ? formatResponse(result, this.modelName)
            : result;
        } catch (e) {
          throwAPIError(e);
        }
      }),
      catchError((err) => {
        throwAPIError(err);
        throw err;
      }),
    );
  }
}

/**
 * Converts any error and throws it as a HttpException
 * @param error to be thrown
 */
export function throwAPIError(error: any) {
  if (error instanceof HttpException) throw error;

  const resp: { errors: APIError[]; statusCode: number } = {
    errors: [],
    statusCode: 0,
  };

  let convertedError = error;
  if (isMongooseError(error))
    convertedError = convertMongooseToServiceErrors(error);

  if (Array.isArray(convertedError))
    for (let i = 0, l = convertedError.length; i < l; i++)
      resp.errors.push(convertToAPIError(convertedError[i]));
  else resp.errors.push(convertToAPIError(convertedError));

  const respStatusCode = resp.errors[0].statusCode;
  resp.statusCode = respStatusCode;

  throw new HttpException(resp, respStatusCode);
}

function isMongooseError(error: any): boolean {
  if (!error) return false;

  return (
    error?.code === 11000 ||
    (error?.name === 'StrictPopulateError' && error?.path) ||
    error instanceof Error.ValidationError
  );
}
