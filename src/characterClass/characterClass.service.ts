import CharacterClassModel from "./characterClass.model";
import { MongooseError, ObjectId } from "mongoose";
import { ICreateCharacterClassInput, IUpdateCharacterClassInput } from "./characterClass";
import RequestError from "../util/error/RequestError";
import {DefenceEnum} from "../enums/defence.enum";

export default class CharacterClassService {
    create = async (input: ICreateCharacterClassInput): Promise<Object | MongooseError | RequestError> => {
        const name = input.name;

        const characterClassWithName = await CharacterClassModel.findOne({name});

         const isCharacterClassNull = characterClassWithName === null;
         if(!isCharacterClassNull)
             throw new RequestError(422, 'CharacterClass with that name already exists');

         if(!isDefenceEnumType(input.mainDefence))
             throw new RequestError(400, 'Field mainDefence must be Defence enum type');

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

     update = async (input: IUpdateCharacterClassInput): Promise<boolean | MongooseError | RequestError> => {
        const { id, name } = input;

        const clanToUpdate = await CharacterClassModel.findById(id);

         if(input.mainDefence && !isDefenceEnumType(input.mainDefence))
             throw new RequestError(400, 'Field mainDefence must be Defence enum type');

         if(!clanToUpdate)
             throw new RequestError(404, 'No CharacterClass with that id found');

         let canUpdate;
         if(!name)
             canUpdate = true;
         else
             canUpdate = await canUpdateName(id, name);

        if(canUpdate){
            const updateResp = await CharacterClassModel.updateOne({_id: id}, input, { rawResult: true });
            return updateResp !== null;
        }

        throw new RequestError(422, 'CharacterClass with that name already exists');
    }

    deleteById = async (id: string): Promise<boolean | MongooseError | RequestError> => {
        const deletedCharacterClass = await CharacterClassModel.findByIdAndDelete(id);

        if(!deletedCharacterClass)
            throw new RequestError(404, 'CharacterClass with that id not found')

        return true;
    }
}

async function canUpdateName(id: ObjectId, name: string): Promise<boolean> {
    const clanWithName = await CharacterClassModel.findOne({name});
    
    if(clanWithName)
        return String(clanWithName._id) === String(id);

    return true;
}

function isDefenceEnumType(str: string): boolean {
    return Object.keys(DefenceEnum).includes(str);
}