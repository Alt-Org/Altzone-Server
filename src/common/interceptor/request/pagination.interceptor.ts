import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Request, Response as Res} from 'express';
import {RequestHelperService} from "../../../requestHelper/requestHelper.service";
import {ModelName} from "../../enum/modelName.enum";

export function Paginate(modelName: ModelName) {
    @Injectable()
    class PaginateInterceptor implements NestInterceptor{
        public constructor(private readonly requestHelperService: RequestHelperService) {
        }
        public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
            const request = context.switchToHttp().getRequest<Request>();
            request['paginationSort'] = {_id: -1};

            const query = request.query;
            const prevCursor = query['prev'];
            const nextCursor = query['next'];
            if(prevCursor){
                request['paginationFilter'] = {_id: {$gt: prevCursor}};
                request['paginationSort'] = {_id: 1};
            } else if(nextCursor)
                request['paginationFilter'] = {_id: {$lt: nextCursor}}

            return next.handle().pipe(map(async (data: any) => {
                if(!Array.isArray(data))
                    return data;

                const httpContext = context.switchToHttp();
                const request = httpContext.getRequest<Request>();
                const response = httpContext.getResponse<Res>();

                if(prevCursor)
                    data.reverse();

                let firstItem_id = data[0]._id;
                let lastItem_id = data[data.length-1]._id;

                let filter;
                let hasPrevBasicFilter = {_id: {$gt: firstItem_id}};
                if(request['mongoFilter']){
                    {$and: []}
                }


                const hasPrev = await this.requestHelperService.findOneRaw(modelName, {_id: {$gt: firstItem_id}}) !== null;
                const hasNext = await this.requestHelperService.findOneRaw(modelName, {_id: {$lt: lastItem_id}}) !== null;

                if(hasPrev)
                    response.set({'prev': `${firstItem_id}`});
                if(hasNext)
                    response.set({'next': `${lastItem_id}`});

                return data;
            }));
        }
    }

    return UseInterceptors(PaginateInterceptor)
}