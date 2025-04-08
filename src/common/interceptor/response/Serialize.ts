import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {plainToInstance} from "class-transformer";
import {IClass} from "../../interface/IClass";

/**
 * Add a serialization, which means removing all fields from response body, which do not have the \@Expose() decorator defined
 * @param dto defines, which fields should be returned and which not
 * @returns
 */
export function Serialize(dto: IClass) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

/**
 * Interceptor that serializes the response data into a specified DTO class using `class-transformer` library.
 * The serialized data replaces the original data in the response before it is sent to the client side.
 *
 * @implements {NestInterceptor}
 */
export class SerializeInterceptor implements NestInterceptor {
    public constructor(private readonly dto: IClass) {
    }

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map(async (data: any) => {
                if (!data)
                    return data;

                const parsedData = await data;

                if(parsedData.metaData?.dataKey){
                    parsedData.data[parsedData.metaData.dataKey] = plainToInstance(this.dto, parsedData.data[parsedData.metaData.dataKey], {
                        excludeExtraneousValues: true
                    });
                    return parsedData;
                }


                const serializedData = plainToInstance(this.dto, parsedData, {
                    excludeExtraneousValues: true
                });

                const dataKey = 'Object';
                parsedData.data = {};

                parsedData['data'][dataKey] = serializedData;
                return parsedData;
            })
        );
    }
}