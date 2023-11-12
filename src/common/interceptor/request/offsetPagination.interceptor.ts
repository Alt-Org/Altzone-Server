import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Request} from 'express';
import {RequestHelperService} from "../../../requestHelper/requestHelper.service";
import { ModelName } from "src/common/enum/modelName.enum";
import {IResponseShape} from "../../interface/IResponseShape";

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
                if(!data)
                    return data;

                const dataParsed = data as IResponseShape;
                if(!dataParsed || dataParsed.metaData.dataType === 'Object')
                    return data;

                const request = context.switchToHttp().getRequest<Request>();
                const withItemCount = query['withPageCount'] === '' || query['withPageCount'] === 'true';

                const paginationData: any = {
                    currentPage: page,
                    limit: paginationLimit,
                    offset: paginationOffset
                }

                if(page === 1 || withItemCount){
                    const itemCount = data.paginationData && data.paginationData.itemCount ?
                        data.paginationData.itemCount :
                        await this.requestHelperService.count(modelName, request['mongoFilter']);

                    paginationData.itemCount = itemCount;
                    paginationData.pageCount = Math.ceil(itemCount/paginationLimit);
                }

                dataParsed.paginationData = paginationData;

                return dataParsed;
            }));
        }
    }

    return UseInterceptors(PaginateInterceptor)
}