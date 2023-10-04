import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {plainToInstance} from "class-transformer";
import {IClass} from "../../interface/IClass";
import {IResponseShape} from "../../interface/IResponseShape";

export function Serialize(dto: IClass) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

class SerializeInterceptor implements NestInterceptor{
    public constructor(private readonly dto: IClass) {
    }
    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data: any) => {
                if(!data)
                    return data;

                const parsedData = data as IResponseShape;
                const serializedData = plainToInstance(this.dto, parsedData.data[parsedData.metaData.dataKey], {
                    excludeExtraneousValues: true
                });
                parsedData.data[parsedData.metaData.dataKey] = serializedData;
                return parsedData;
            })
        );
    }
}