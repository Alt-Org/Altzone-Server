import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {Request} from 'express';
import {instanceToPlain} from "class-transformer";
import {operators, querySelectors, queryToDB} from "../../type/search.type";
import {IClass} from "../../interface/IClass";

export function AddMetaDataQuery() {
    return UseInterceptors(new AddMetaDataQueryInterceptor());
}

class AddMetaDataQueryInterceptor implements NestInterceptor{
    public constructor() {
    }

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const query = request.query;
        if(!query || !query.metaData)
            return next.handle();

        request['metaData'] = (query.metaData as string).split(';');

        return next.handle();
    }
}