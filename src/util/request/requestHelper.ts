import mongoose, {MongooseError} from "mongoose";
import RequestError from "../error/requestError";

export default class RequestHelper {
    public populateCollections = (modelName: string, _id: string, includeCollections: string[]): Promise<Object | null | MongooseError | RequestError | any> | null => {
        const model = mongoose.model(modelName);

        const dataObj = model.findById(_id);
        if(!dataObj)
            return null;

        let result;
        for(let i=0; i<includeCollections.length; i++)
            result = dataObj.populate(includeCollections[i]);

        if(!result)
            return dataObj;

        return result;
    }
}