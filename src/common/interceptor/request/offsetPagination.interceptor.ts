import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Request, Response as Res} from 'express';
import {RequestHelperService} from "../../../requestHelper/requestHelper.service";

export function OffsetPaginate(minLimit: number=20, maxLimit:number=50) {
    @Injectable()
    class PaginateInterceptor implements NestInterceptor{
        public constructor(private readonly requestHelperService: RequestHelperService) {
        }
        public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
            const request = context.switchToHttp().getRequest<Request>();
            const query = request.query;

            let paginationLimit = +query['limit'] || minLimit;
            if(paginationLimit < 1)
                paginationLimit = minLimit;
            if(paginationLimit > maxLimit)
                paginationLimit = maxLimit;

            const page = +query['page'] || 1;
            const paginationOffset = (page-1)*paginationLimit;

            request['paginationLimit'] = paginationLimit;
            request['paginationOffset'] = paginationOffset;

            return next.handle().pipe(map(async (data: any) => {
                return data;
            }));
        }
    }

    return UseInterceptors(PaginateInterceptor)
}