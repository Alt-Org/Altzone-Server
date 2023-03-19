import CharacterClassModel from "./customCharacter.model";
import {MongooseError} from "mongoose";
import {ICreateCharacterClassInput, IUpdateCharacterClassInput} from "./customCharacter";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class CustomCharacterService {
    create = async (input: ICreateCharacterClassInput): Promise<Object | MongooseError | RequestError> => {
        return CharacterClassModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CharacterClassModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return CharacterClassModel.find();
    }

     updateById = async (input: IUpdateCharacterClassInput): Promise<UpdateResult> => {
        return CharacterClassModel.updateOne({_id: input._id}, input, {rawResult: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CharacterClassModel.findByIdAndDelete(_id);
    }
}