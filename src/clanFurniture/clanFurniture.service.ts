import ClanFurnitureModel from "./clanFurniture.model";
import {MongooseError} from "mongoose";
import {ICreateClanFurnitureInput, IUpdateClanFurnitureInput} from "./clanFurniture";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class ClanFurnitureService {
    create = async (input: ICreateClanFurnitureInput): Promise<Object | MongooseError | RequestError> => {
        return ClanFurnitureModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return ClanFurnitureModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return ClanFurnitureModel.find();
    }

     updateById = async (input: IUpdateClanFurnitureInput): Promise<UpdateResult> => {
        return ClanFurnitureModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return ClanFurnitureModel.deleteOne({_id});
    }
}