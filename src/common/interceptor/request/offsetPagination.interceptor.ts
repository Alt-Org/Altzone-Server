import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { RequestHelperService } from '../../../requestHelper/requestHelper.service';
import { ModelName } from '../../../common/enum/modelName.enum';
import { IResponseShape } from '../../interface/IResponseShape';

/**
 * Extracts pagination data from queries and adds to the request object:
 * - `paginationLimit` with max amount of objects to be queried
 * - `paginationOffset` with offset of the query
 *
 * Also adds a `paginationData` field to the response body object with some usable information about the pagination.
 *
 * @param modelName used to calculate the total amount of objects of this model in DB
 * @param minLimit defines the min value for the "limit" query on the client side, so if the client will set limit below min this minLimit value will be used instead
 * @param maxLimit defines the max value for the "limit" query on the client side, so if the client will set limit above max this maxLimit value will be used instead
 * @returns
 */
export function OffsetPaginate(
  modelName: ModelName,
  minLimit: number = 20,
  maxLimit: number = 50,
) {
  @Injectable()
  class PaginateInterceptor implements NestInterceptor {
    public constructor(
      private readonly requestHelperService: RequestHelperService,
    ) {}
    public intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      const query = request.query;

      let paginationLimit = +query['limit'] || minLimit;
      if (paginationLimit < 1) paginationLimit = minLimit;
      if (paginationLimit > maxLimit) paginationLimit = maxLimit;

      const page = +query['page'] || 1;
      const paginationOffset = (page - 1) * paginationLimit;

      request['paginationLimit'] = paginationLimit;
      request['paginationOffset'] = paginationOffset;

      return next.handle().pipe(
        map(async (data: any) => {
          if (!data) return data;

          const dataParsed = (await data) as IResponseShape;
          if (
            !dataParsed ||
            !dataParsed.metaData ||
            !dataParsed.metaData.dataType ||
            dataParsed.metaData.dataType === 'Object'
          )
            return data;

          const request = context.switchToHttp().getRequest<Request>();
          const withItemCount =
            query['withPageCount'] === '' || query['withPageCount'] === 'true';

          const paginationData: any = {
            currentPage: page,
            limit: paginationLimit,
            offset: paginationOffset,
          };

          if (page === 1 || withItemCount) {
            const itemCount =
              data.paginationData && data.paginationData.itemCount
                ? data.paginationData.itemCount
                : await this.requestHelperService.count(
                    modelName,
                    request['mongoFilter'],
                  );

            paginationData.itemCount = itemCount;
            paginationData.pageCount = Math.ceil(itemCount / paginationLimit);
          }

          dataParsed.paginationData = paginationData;

          return dataParsed;
        }),
      );
    }
  }

  return UseInterceptors(PaginateInterceptor);
}
