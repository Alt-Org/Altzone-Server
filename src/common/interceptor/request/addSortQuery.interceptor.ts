import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {Request} from 'express';
import {instanceToPlain} from "class-transformer";
import {IClass} from "../../interface/IClass";

/**
 * Extract `sort` query from the request and adds `mongoSort` field to request object, 
 * which can be used in mongoose queries as it is.
 * 
 * @param dtoClass The DTO class used to define which fields are allowed to be sorted.
 * @returns 
 */
export function AddSortQuery(dtoClass: IClass) {
    return UseInterceptors(new AddSortQueryInterceptor(dtoClass))
}

/**
 * Interceptor that processes sort query parameters from an HTTP request and transforms them into a MongoDB sort object.
 * The generated sort object is attached to the request object as `mongoSort`.
 * 
 * @implements {NestInterceptor}
 */
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