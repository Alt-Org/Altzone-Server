import {UpdateResult} from "mongodb";
import UpdateError from "../error/updateError";
import ReadError from "../error/readError";
import DeleteError from "../error/deleteError";
import {Dictionary} from "../dictionary";
import {Query} from "mongoose";

export default class DefaultResponseErrorThrower {
    throwReadErrorsIfFound = (queryResult: Object | Array<any> | null, className: string, field: string) => {
        if(queryResult instanceof Array && queryResult.length === 0)
            throw new ReadError(404, `Can not find any ${className} instances`);
        if(queryResult == null)
            throw new ReadError(404, `Can not find ${className} with that ${field} (${Dictionary.values[className]['apiToGame'][field]} on game side)`);
    }

    throwUpdateErrorsIfFound = (queryResult: UpdateResult, className: string, field: string) => {
        if(queryResult.matchedCount === 0)
            throw new UpdateError(404, `No ${className} with that ${field} (${Dictionary.values[className]['apiToGame'][field]} on game side) found`);
        if(queryResult.modifiedCount === 0)
            throw new UpdateError(400, 'Nothing to update');
    }

    throwDeleteErrorsIfFound = (queryResult: Object | any | null, className: string, field: string) => {
        if(queryResult == null || (queryResult.deletedCount != null && queryResult.deletedCount === 0))
            throw new DeleteError(404, `Can not find ${className} with that ${field} (${Dictionary.values[className]['apiToGame'][field]} on game side)`)
    }
}