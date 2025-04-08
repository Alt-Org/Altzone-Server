import {HttpException} from "@nestjs/common/exceptions/http.exception";
import {isServiceError} from "../../service/basicService/ServiceError";
import {APIError, convertToAPIError, isAPIError} from "../../controller/APIError";
import formatResponse from "../../controller/formatResponse";
import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import {Observable} from "rxjs";
import {map, catchError} from "rxjs/operators";

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
    constructor(private readonly modelName?: string) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(async (returnValue) => {
                try {
                    const result = await returnValue;

                    if (Array.isArray(result) && result.length === 2 && result[1] === null) {
                        const data = result[0];
                        return formatResponse(data, this.modelName);
                    }

                    if (Array.isArray(result) && result.length === 2 && result[0] === null) {
                        throw result[1];
                    }

                    if (isServiceError(result) || isAPIError(result)) {
                        throw result;
                    }

                    return result != null ? formatResponse(result, this.modelName) : result;
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
    const resp: { errors: APIError[], statusCode: number } = {errors: [], statusCode: 0};
    if (Array.isArray(error))
        for (let i = 0, l = error.length; i < l; i++)
            resp.errors.push(convertToAPIError(error[i]));
    else
        resp.errors.push(convertToAPIError(error));

    const respStatusCode = resp.errors[0].statusCode;
    resp.statusCode = respStatusCode;

    throw new HttpException(resp, respStatusCode);
}
