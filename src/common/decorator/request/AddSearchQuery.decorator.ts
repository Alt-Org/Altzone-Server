import {IClass} from "../../interface/IClass";
import {operators, querySelectors, queryToDB} from "../../type/search.type";
import {instanceToPlain} from "class-transformer";

export const AddSearchQueryDecorator = (dtoClass: IClass) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
        const originalMethod = descriptor.value;
        descriptor.value = function (this: any, ...args: any[]) {
            if(!areArgsValid(args))
                throw new Error(`The ${AddSearchQueryDecorator.name} decorator needs Request object as the first argument of the method`);

            let {query} = args[0];
            if(!query || !query['search'])
                return originalMethod.apply(this, args);

            let searchQuery: string = query.search;
            //name="lol";AND;age>=18;
            if(searchQuery.charAt(searchQuery.length-1) === ';')
                searchQuery = searchQuery.substring(0, searchQuery.length-1);

            const searchParts = searchQuery.split(';');
            //Should be odd count, if not it is something like: name="lol";AND
            if(searchParts.length % 2 === 0)
                return originalMethod.apply(this, args);;

            //Get fields that can be queried
            const dtoClassInstance = new dtoClass();
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
                return originalMethod.apply(this, args);

            args[0]['mongoFilter'] = andQueries.length === 1 ? andQueries[0] : {$or: andQueries};

            return originalMethod.apply(this, args);
        }

        return descriptor;
    }
}

interface FlatQuery {
    field: string;
    selector: string;
    value: string | number;
}
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

function areArgsValid(args: any[]) {
    const request = args[0];
    return request instanceof Object && request['body'] && request['query'];
}