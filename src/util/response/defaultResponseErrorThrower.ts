import {UpdateResult} from "mongodb";
import UpdateError from "../error/updateError";
import RequestError from "../error/requestError";
import ReadError from "../error/readError";
import DeleteError from "../error/deleteError";

export default class DefaultResponseErrorThrower {
    throwReadErrorsIfFound = (queryResult: Object | Array<any> | null, className: string, field: string) => {
        if(queryResult instanceof Array && queryResult.length === 0)
            throw new ReadError(404, `Can not find any ${className} instances`);
        if(queryResult == null)
            throw new ReadError(404, `Can not find ${className} with that ${field}`);
    }

    throwUpdateErrorsIfFound = (queryResult: UpdateResult, className: string, field: string) => {
        if(queryResult.matchedCount === 0)
            throw new UpdateError(404, `No ${className} with that ${field} found`);
        if(queryResult.modifiedCount === 0)
            throw new UpdateError(400, 'Nothing to update');
    }

    throwDeleteErrorsIfFound = (queryResult: Object | null, className: string, field: string) => {
        if(queryResult == null)
            throw new DeleteError(404, `Can not find ${className} with that ${field}`)
    }
}