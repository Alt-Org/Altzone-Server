import CharacterClassModel from "./characterClass.model";
import {Model, MongooseError, ObjectId} from "mongoose";
import { ICreateCharacterClassInput, IUpdateCharacterClassInput } from "./characterClass";
import RequestError from "../util/error/requestError";
import UpdateError from "../util/error/updateError";

export default class CharacterClassService {
    create = async (input: ICreateCharacterClassInput): Promise<Object | MongooseError | RequestError> => {
        const characterClassWithName = await CharacterClassModel.findOne({ name: input.name});

         if(characterClassWithName)
             throw new RequestError(422, 'CharacterClass with that name already exists');

        return CharacterClassModel.create(input);
    }

    readById = async (id: string): Promise<Object | MongooseError | RequestError> => {
        const characterClassToReturn = await CharacterClassModel.findById(id);

        if(!characterClassToReturn)
            throw new RequestError(404, 'Can not find CharacterClass with that id');

        return characterClassToReturn;
    }

    readAll = async (): Promise<Object | MongooseError> => {
        return CharacterClassModel.find();
    }

     update = async (input: IUpdateCharacterClassInput): Promise<boolean | MongooseError | UpdateError> => {
        const updateResp = await CharacterClassModel.updateOne({_id: input.id}, input, { rawResult: true });

         if(updateResp.matchedCount === 0)
             throw new UpdateError(404, 'No CharacterClass with that id found');
         if(updateResp.modifiedCount === 0)
             throw new UpdateError(400, 'Nothing to update');

        return true;
    }

    deleteById = async (id: string): Promise<boolean | MongooseError | RequestError> => {
        const deletedCharacterClass = await CharacterClassModel.findByIdAndDelete(id);

        if(!deletedCharacterClass)
            throw new RequestError(404, 'CharacterClass with that id not found')

        return true;
    }
}