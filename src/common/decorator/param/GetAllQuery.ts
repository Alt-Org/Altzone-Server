import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";
import {IGetAllQuery} from "../../interface/IGetAllQuery";

export const GetAllQuery = createParamDecorator((data: unknown, context: ExecutionContext): IGetAllQuery => {
    const request = context.switchToHttp().getRequest<Request>();
    const allowedFields = request['allowedFields'];
    const mongoFilter = request['mongoFilter'] ? request['mongoFilter'] : {};

    return {
        select: allowedFields,
        filter: mongoFilter
    }
});