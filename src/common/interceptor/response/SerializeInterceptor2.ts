import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { IClass } from '../../interface/IClass';

/**
 * Interceptor that serializes the response data into a specified DTO class using `class-transformer` library.
 * The serialized data replaces the original data in the response before it is sent to the client side.
 *
 * @implements {NestInterceptor}
 */
export class SerializeInterceptor2 implements NestInterceptor {
  public constructor(private readonly dto?: IClass) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(async (data: any) => {
        if (!data || !this.dto) return data;

        const parsedData = await data;

        let dataToReturn = parsedData;

        if (isTupleWithError(parsedData)) return parsedData;

        if (isTupleWithData(parsedData)) dataToReturn = parsedData[0];

        const serializedData = plainToInstance(this.dto, dataToReturn, {
          excludeExtraneousValues: true,
        });

        return [serializedData, null];
      }),
    );
  }
}

/**
 * Determines whenever the provided data is of type IServiceReturn and has an error in it
 * @param data data to check
 *
 * @returns true if tuple with error or false if it is not a tuple, or it has no error
 */
function isTupleWithError(data: any) {
  return (
    Array.isArray(data) && data.length === 2 && data[1] && data[0] === null
  );
}

/**
 * Determines whenever the provided data is of type IServiceReturn and has data in it
 * @param data data to check
 *
 * @returns true if tuple with data or false if it is not a tuple, or it has no data
 */
function isTupleWithData(data: any) {
  return (
    Array.isArray(data) && data.length === 2 && data[0] && data[1] === null
  );
}
