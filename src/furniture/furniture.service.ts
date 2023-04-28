import FurnitureModel from "./furniture.model";
import {MongooseError} from "mongoose";
import {ICreateFurnitureInput, IUpdateFurnitureInput} from "./furniture";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class FurnitureService {
    create = async (input: ICreateFurnitureInput): Promise<Object | MongooseError | RequestError> => {
        return FurnitureModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return FurnitureModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return FurnitureModel.find();
    }

     updateById = async (input: IUpdateFurnitureInput): Promise<UpdateResult> => {
        return FurnitureModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return FurnitureModel.deleteOne({_id});
    }
}