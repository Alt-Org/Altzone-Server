import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";
import {IGetAllQuery} from "../../interface/IGetAllQuery";

//TODO: limit to .env ?

/**
 * Get all data added by \@OffsetPaginate(), \@AddSearchQuery(), \@AddSortQuery() decorators 
 * and convert it to the search options object usable for mongoose queries
 */
export const GetAllQuery = createParamDecorator((data: unknown, context: ExecutionContext): IGetAllQuery => {
    const request = context.switchToHttp().getRequest<Request>();
    const query = request.query;

    const select = request['allowedFields'];

    const mongoFilter = request['mongoFilter'] || {};

    const minLimit = 20;
    const maxLimit = 50;
    let limit = request['paginationLimit'] || query['limit'] || minLimit;
    if(query['limit'] && limit < 1)
        limit = minLimit;
    if(query['limit'] && limit > maxLimit)
        limit = maxLimit;

    const mongoSort = request['mongoSort'];

    const skip = request['paginationOffset'] || 0;

    const sort = mongoSort || {_id: -1};

    return {
        select,
        filter: mongoFilter,
        sort,
        limit,
        skip
    }
});