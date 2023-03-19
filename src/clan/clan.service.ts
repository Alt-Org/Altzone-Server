import ClanModel from "./clan.model";
import {MongooseError} from "mongoose";
import {ICreateClanInput, IUpdateClanInput} from "./clan";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class ClanService{
    create = async (input: ICreateClanInput): Promise<Object | MongooseError | RequestError> => {
        return ClanModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return ClanModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return ClanModel.find();
    }

     updateById = async (input: IUpdateClanInput): Promise<UpdateResult> => {
         return ClanModel.updateOne({_id: input._id}, input, { rawResult: true });
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return ClanModel.findByIdAndDelete(_id);
    }
}