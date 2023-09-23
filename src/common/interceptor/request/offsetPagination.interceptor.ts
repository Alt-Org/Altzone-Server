import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Request, Response} from 'express';
import {RequestHelperService} from "../../../requestHelper/requestHelper.service";
import { ModelName } from "src/common/enum/modelName.enum";

export function OffsetPaginate(modelName: ModelName, minLimit: number=20, maxLimit:number=50) {
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
                if(!Array.isArray(data))
                    return data;

                const request = context.switchToHttp().getRequest<Request>();
                const response = context.switchToHttp().getResponse<Response>();
                const isFirstReq = query['isFirstReq'] === '' || query['isFirstReq'] === 'true';
                if(page === 1 || isFirstReq){
                    const itemCount = await this.requestHelperService.count(modelName, request['mongoFilter']);
                    response.set({itemCount});
                    const pageCount = Math.ceil(itemCount/paginationLimit);
                    response.set({pageCount});
                }
                response.set({'currentPage': page});
                response.set({'limit': paginationLimit});
                response.set({'offset': paginationOffset});

                return data;
            }));
        }
    }

    return UseInterceptors(PaginateInterceptor)
}