import {CallHandler, ExecutionContext, NestInterceptor, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {Request} from 'express';
import {instanceToPlain} from "class-transformer";
import {operators, querySelectors, queryToDB} from "../../type/search.type";
import {IClass} from "../../interface/IClass";

/**
 * Extracts `search` query from the request and adds `mongoFilter` field to request object, 
 * which can be used in mongoose queries as it is.
 * @param dtoClass used to determine allowed searching fields
 * @returns 
 */
export function AddSearchQuery(dtoClass: IClass) {
    return UseInterceptors(new AddSearchQueryInterceptor(dtoClass))
}

/**
 * Interceptor that processes search query parameters from an HTTP request and transforms them into a MongoDB filter object.
 * The generated filter is attached to the request object as `mongoFilter`.
 * 
 * @implements {NestInterceptor}
 */
class AddSearchQueryInterceptor implements NestInterceptor{
    public constructor(private readonly dtoClass: IClass) {
    }

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const query = request.query;
        if(!query || !query.search)
            return next.handle();

        let searchQuery = query.search as string;
        //name="lol";AND;age>=18;
        if(searchQuery.charAt(searchQuery.length-1) === ';')
            searchQuery = searchQuery.substring(0, searchQuery.length-1);

        const searchParts = searchQuery.split(';');
        //Should be odd count, if not it is something like: name="lol";AND
        if(searchParts.length % 2 === 0)
            return next.handle();

        //Get fields that can be queried
        const dtoClassInstance = new this.dtoClass();
        const possibleFields = Object.getOwnPropertyNames(instanceToPlain(dtoClassInstance));

        const andGroups: string[][] = [];
        //split query by ORs
        let andGroupStart = 0;
        for(let i=0; i<searchParts.length; i++){
            if(searchParts[i] === operators.OR){
                andGroups.push(searchParts.slice(andGroupStart, i));
                andGroupStart = i+1;
            }
        }
        //add last and group
        andGroups.push(searchParts.slice(andGroupStart));

        //Generate { $and: [] } mongo queries
        const andQueries: Object[] = [];
        for(let i=0; i<andGroups.length; i++){
            const group = andGroups[i];
            let andQuery = { $and: [] };
            for(let i=0; i<group.length; i+=2){
                const query = unpackSearchPair(group[i], possibleFields);
                if(!query)
                    break;
                andQuery.$and.push({[query.field]: {[query.selector]: query.value}});
            }
            if(andQuery.$and.length !== 0)
                andQueries.push(andQuery);
        }

        if(andQueries.length === 0)
            return next.handle();

        request['mongoFilter'] = andQueries.length === 1 ? andQueries[0] : {$or: andQueries};

        return next.handle();
    }
}

interface FlatQuery {
    field: string;
    selector: string;
    value: string | number;
}

/**
 * Extracts and validates a key-value pair from a search string, returning an object containing the field, selector, and value.
 * 
 * @param searchPair The key-value pair string to unpack, in the form "field=value" or "field>=value".
 * @param allowedFields The list of fields that are permitted to be used in the search query.
 * @returns An object containing the field, selector, and value if valid, or null if invalid.
 */
function unpackSearchPair(searchPair: string, allowedFields: string[]): FlatQuery | null {
    //Find splitter = operator like >,<, = etc.
    const pairChars = [...searchPair];
    let splitter: string;
    for(let i=0; i<pairChars.length; i++){
        const char = pairChars[i];
        if(querySelectors.includes(char)){
            splitter = char;
            if((char === '<' || char === '>') && pairChars[i+1] === '=')
                splitter += '=';
            break;
        }
    }

    const splitPair = searchPair.split(splitter);
    //if no key-value pair or search field is not allowed
    if(splitPair.length !== 2 || !allowedFields.includes(splitPair[0]))
        return null;

    const [field, value] = splitPair;
    const isValueString = value.includes('"');
    //if the condition for a string field is not equals('=')
    if(isValueString && splitter !== '=')
        return null;

    let selector = queryToDB[splitter];
    if(!selector)
        return null;
    const parsedValue = isValueString ? value.substring(1, value.length-1) : Number(value);
    if(!parsedValue)
        return null;

    if(typeof parsedValue === 'string' && parsedValue.includes('.'))
        selector = '$regex';

    return {
        field: field,
        selector: selector,
        value: parsedValue
    }
}