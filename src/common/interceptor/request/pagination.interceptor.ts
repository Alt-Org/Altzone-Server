import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import { Response as Res } from 'express';

export function Paginate() {
    return UseInterceptors(new PaginateInterceptor())
}

class PaginateInterceptor implements NestInterceptor{
    public constructor() {
    }
    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(map((data: any) => {
            const httpContext = context.switchToHttp();
            const response = httpContext.getResponse<Res>();
            response.set({'Test-Header': 'test'})

            return data;
        }));
    }
}