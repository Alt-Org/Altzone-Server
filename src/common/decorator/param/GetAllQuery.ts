import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";
import {IGetAllQuery} from "../../interface/IGetAllQuery";

//TODO: limit to .env ?

export const GetAllQuery = createParamDecorator((data: unknown, context: ExecutionContext): IGetAllQuery => {
    const request = context.switchToHttp().getRequest<Request>();
    const select = request['allowedFields'];
    const mongoFilter = request['mongoFilter'] ? request['mongoFilter'] : {};

    const query = request.query;

    let paginationSort = request['paginationSort'];
    let sort = paginationSort;

    const minLimit = 20;
    const maxLimit = 50;
    let limit = +query['limit'] || minLimit;
    if(limit < 1)
        limit = minLimit;
    if(limit > maxLimit)
        limit = maxLimit;

    return {
        select,
        filter: mongoFilter,
        sort,
        limit
    }
});