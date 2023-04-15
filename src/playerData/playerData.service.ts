import PlayerDataModel from "./playerData.model";
import {MongooseError} from "mongoose";
import {ICreatePlayerDataInput, IUpdatePlayerDataInput} from "./playerData.d";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class PlayerDataService {
    create = async (input: ICreatePlayerDataInput): Promise<Object | MongooseError | RequestError> => {
        return PlayerDataModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return PlayerDataModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return PlayerDataModel.find();
    }

     updateById = async (input: IUpdatePlayerDataInput): Promise<UpdateResult> => {
        return PlayerDataModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return PlayerDataModel.deleteOne({_id});
    }
}