import PlayerDataModel from "./playerData.model";
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

    public readOneWithCollections = (_id: string, withQuery: string): Promise<Object | null | MongooseError | RequestError> | null => {
        const playerDataObj = PlayerDataModel.findById(_id);
        if(!playerDataObj)
            return null;

        const inputCollections = withQuery.split('_');
        const checkedCollections :string[] = [];

        //Check are the queried collections exists
        for(let i=0; i<inputCollections.length; i++){
            if (Object.values(ClassName).find( elem => elem === inputCollections[i] ) !== undefined)
                checkedCollections.push(inputCollections[i]);
        }

        return fetch("");
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