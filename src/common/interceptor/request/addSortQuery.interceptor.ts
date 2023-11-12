import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {Request} from 'express';
import {instanceToPlain} from "class-transformer";
import {operators} from "../../type/search.type";
import {IClass} from "../../interface/IClass";

export function AddSortQuery(dtoClass: IClass) {
    return UseInterceptors(new AddSortQueryInterceptor(dtoClass))
}

class AddSortQueryInterceptor implements NestInterceptor{
    public constructor(private readonly dtoClass: IClass) {
    }

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const query = request.query;
        if(!query || !query['sort'])
            return next.handle();

        const sortQuery = query['sort'] as string;
        const orderQuery = (query['desc'] === '' || query['desc'] === 'true') ? -1 : 1;

        //Get fields that can be queried
        const dtoClassInstance = new this.dtoClass();
        const possibleFields = Object.getOwnPropertyNames(instanceToPlain(dtoClassInstance));

        if(!possibleFields.includes(sortQuery))
            return next.handle();

        request['mongoSort'] = {[sortQuery]: orderQuery};

        return next.handle();
    }
}