import CharacterClassModel from "./characterClass.model";
import {Model, MongooseError, ObjectId} from "mongoose";
import { ICreateCharacterClassInput, IUpdateCharacterClassInput } from "./characterClass";
import RequestError from "../util/error/requestError";
import UpdateError from "../util/error/updateError";
import APIError from "../util/error/apiError";
import {UpdateResult} from "mongodb";

export default class CharacterClassService {
    create = async (input: ICreateCharacterClassInput): Promise<Object | MongooseError | RequestError> => {
        return CharacterClassModel.create(input);
    }

    readById = async (id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CharacterClassModel.findById(id);
    }

    readAll = async (): Promise<Array<any>> => {
        return CharacterClassModel.find();
    }

     updateById = async (input: IUpdateCharacterClassInput): Promise<UpdateResult> => {
        return CharacterClassModel.updateOne({_id: input.id}, input, {rawResult: true});
    }

    deleteById = async (id: string): Promise<Object | null | MongooseError | RequestError> => {
        return CharacterClassModel.findByIdAndDelete(id);
    }
}