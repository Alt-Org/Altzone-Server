import {UpdateResult} from "mongodb";
import UpdateError from "../error/updateError";
import ReadError from "../error/readError";
import DeleteError from "../error/deleteError";

export default class DefaultResponseErrorThrower {

    public constructor(className: string) {
        this.className = className;
    }

    private readonly className: string;

    throwReadErrorsIfFound = (queryResult: Object | Array<any> | null, field: string) => {
        if(queryResult instanceof Array && queryResult.length === 0)
            throw new ReadError(404, `Can not find any ${this.className} instances`);
        if(queryResult == null)
            throw new ReadError(404, `Can not find ${this.className} with that ${field}`);
    }

    throwUpdateErrorsIfFound = (queryResult: UpdateResult, field: string) => {
        if(queryResult.matchedCount === 0)
            throw new UpdateError(404, `No ${this.className} with that ${field} on game side) found`);
        if(queryResult.modifiedCount === 0)
            throw new UpdateError(400, 'Nothing to update');
    }

    throwDeleteErrorsIfFound = (queryResult: Object | any | null, field: string) => {
        if(queryResult == null || (queryResult.deletedCount != null && queryResult.deletedCount === 0))
            throw new DeleteError(404, `Can not find ${this.className} with that ${field}`)
    }
}