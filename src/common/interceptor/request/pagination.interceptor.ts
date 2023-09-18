import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Request, Response as Res} from 'express';
import {RequestHelperService} from "../../../requestHelper/requestHelper.service";
import {ModelName} from "../../enum/modelName.enum";
import {PlayerDto} from "../../../player/dto/player.dto";
import {IClass} from "../../interface/IClass";

export function Paginate(modelName: ModelName) {
    @Injectable()
    class PaginateInterceptor implements NestInterceptor{
        public constructor(private readonly requestHelperService: RequestHelperService) {
        }
        public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
            const request = context.switchToHttp().getRequest<Request>();
            request['paginationSort'] = {_id: -1};

            const query = request.query;
            if(query['previousCursor'])
                request['paginationFilter'] = {_id: {$gt: query['previousCursor']}};
            else if(query['nextCursor'])
                request['paginationFilter'] = {_id: {$lt: query['nextCursor']}};

            return next.handle().pipe(map(async (data: any) => {
                if(!data || !data.length || data.length === 0)
                    return data;

                const httpContext = context.switchToHttp();
                const response = httpContext.getResponse<Res>();

                let firstItem_id = data[0]._id;
                let lastItem_id = data[data.length-1]._id;

                const hasPrev = await this.requestHelperService.findOneRaw(modelName, {_id: {$gt: firstItem_id}}) !== null;
                const hasNext = await this.requestHelperService.findOneRaw(modelName, {_id: {$lt: lastItem_id}}) !== null;

                if(hasPrev)
                    response.set({'Previous-Cursor': `${firstItem_id}`});
                if(hasNext)
                    response.set({'Next-Cursor': `${lastItem_id}`});

                return data;
            }));
        }
    }

    return UseInterceptors(PaginateInterceptor)
}