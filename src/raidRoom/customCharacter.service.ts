import CustomCharacterModel from "./raidRoom.model";
import {MongooseError} from "mongoose";
import {ICreateCustomCharacterInput, IUpdateCustomCharacterInput} from "./customCharacter";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class CustomCharacterService {
    create = async (input: ICreateCustomCharacterInput): Promise<Object | MongooseError | RequestError> => {
        return CustomCharacterModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CustomCharacterModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return CustomCharacterModel.find();
    }

     updateById = async (input: IUpdateCustomCharacterInput): Promise<UpdateResult> => {
        return CustomCharacterModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CustomCharacterModel.deleteOne({_id});
    }
}