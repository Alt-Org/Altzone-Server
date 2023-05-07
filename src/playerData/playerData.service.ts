import PlayerDataModel, {CollectionRefs} from "./playerData.model";
import  {MongooseError} from "mongoose";
import {ICreatePlayerDataInput, IUpdatePlayerDataInput} from "./playerData.d";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";
import RequestHelper from "../util/request/requestHelper";
import {ClassName} from "../util/dictionary";


const requestHelper = new RequestHelper();
export default class PlayerDataService {
    public create = async (input: ICreatePlayerDataInput): Promise<Object | MongooseError | RequestError> => {
        return PlayerDataModel.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return PlayerDataModel.findById(_id);
    }

    public readOneWithCollections = (_id: string, withQuery: string): Promise<Object | null | MongooseError | RequestError | any> | null | any => {
        const inputCollections = withQuery.split('_');

        const existingRefs = [];
        for(let i=0; i<inputCollections.length; i++){
            const modelName = inputCollections[i];
            if(CollectionRefs.includes(inputCollections[i]))
                existingRefs.push(modelName);
        }

        return requestHelper.populateCollections(ClassName.PLAYER_DATA, _id, existingRefs);
    }

    public readOneAllCollections = (_id: string): Promise<Object | null | MongooseError | RequestError | any> | null | any => {
        return requestHelper.populateCollections(ClassName.PLAYER_DATA, _id, CollectionRefs);
    }

    public readAll = async (): Promise<Array<any>> => {
        return PlayerDataModel.find();
    }

    public updateById = async (input: IUpdatePlayerDataInput): Promise<UpdateResult> => {
        return PlayerDataModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    public deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return PlayerDataModel.deleteOne({_id});
    }
}