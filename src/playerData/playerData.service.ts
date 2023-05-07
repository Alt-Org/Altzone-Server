import PlayerDataModel, {CollectionRefs} from "./playerData.model";
import  {MongooseError} from "mongoose";
import {ICreatePlayerDataInput, IUpdatePlayerDataInput} from "./playerData.d";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";
import {ClassName} from "../util/dictionary";

export default class PlayerDataService {
    public create = async (input: ICreatePlayerDataInput): Promise<Object | MongooseError | RequestError> => {
        return PlayerDataModel.create(input);
    }

    public readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return PlayerDataModel.findById(_id);
    }

    public readOneWithCollections = (_id: string, withQuery: string): Promise<Object | null | MongooseError | RequestError | any> | null | any => {
        const playerDataObj = PlayerDataModel.findById(_id);
        if(!playerDataObj)
            return null;

        const inputCollections = withQuery.split('_');

        let result;
        for(let i=0; i<inputCollections.length; i++){
            const modelName = inputCollections[i];
            if (Object.values(ClassName).find( elem => elem === modelName ) !== undefined)
                result = playerDataObj.populate(CollectionRefs[modelName]);
        }

        return result;
    }

    public readOneAllCollections = (_id: string): Promise<Object | null | MongooseError | RequestError | any> | null | any => {
        const playerDataObj = PlayerDataModel.findById(_id);
        if(!playerDataObj)
            return null;

        let result;
        const modelNames = Object.values(CollectionRefs);
        for(let i=0; i<modelNames.length; i++)
            result = playerDataObj.populate(modelNames[i]);

        return result;
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