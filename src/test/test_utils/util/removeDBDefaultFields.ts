import {Document} from "mongoose";

/**
 * Removes mongoose default fields from an object or array, such as __v and id.
 *
 * @param dbResponse response from DB
 * @returns cleared array or object, or null if the response is null
 */
export function clearDBRespDefaultFields<TResponse>(dbResponse: TResponse) {
    if(!dbResponse)
        return null;

    if(Array.isArray(dbResponse)){
        const clearedResponse = [];
        for(let i=0; i<dbResponse.length; i++){
            clearedResponse[i] = clearObject(dbResponse[i]);
        }
        return clearedResponse as TResponse;
    }

    return clearObject(dbResponse);
}

function clearObject<TResponse>(dbObject: TResponse){
    if(dbObject instanceof Document)
        dbObject = dbObject.toObject();

    const {id, __v, ...clearedResponse} = {...dbObject, id: undefined, __v: undefined};
    return clearedResponse as TResponse;
}