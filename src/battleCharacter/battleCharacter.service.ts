import BattleCharacterModel from "./battleCharacter.model";
import {MongooseError} from "mongoose";
import {ICreateBattleCharacterInput} from "./battleCharacter.d";
import RequestError from "../util/error/requestError";

import CharacterClassModel from "../characterClass/characterClass.model";
import CustomCharacterModel from "../customCharacter/customCharacter.model";
import ValidationError from "../util/error/validationError";
import {ObjectId} from "mongodb";

export default class BattleCharacterService {
    create = async (input: ICreateBattleCharacterInput): Promise<Object | MongooseError | RequestError> => {
        const {characterClass_id, customCharacter_id} = input;

        const baseCharacterClass: any = await CharacterClassModel.findById(characterClass_id);
        const baseCustomCharacter: any = await CustomCharacterModel.findById(customCharacter_id);

        const combinedObj = {
            unityKey: '',
            name: '',
            resistance: 0,
            speed: 0,
            attack: 0,
            defence: 0,
            customCharacterGameId: 0,

            characterClassGameId: 0,
            characterClassName: '',
            mainDefence: 0,

            characterClass_id: '',
            customCharacter_id: ''
        };

        if(baseCharacterClass && baseCharacterClass._doc){
            const {gameId, name, mainDefence} = baseCharacterClass._doc;
            combinedObj.characterClassGameId = gameId;
            combinedObj.characterClassName = name;
            combinedObj.mainDefence = mainDefence;
        } else
            throw new ValidationError(400, "Could not find CharacterClass with that _id");

        if(baseCustomCharacter && baseCustomCharacter._doc){
            const {unityKey, name, speed, resistance, attack, defence} = baseCustomCharacter._doc;
            combinedObj.unityKey = unityKey;
            combinedObj.name = name;
            combinedObj.speed = speed;
            combinedObj.resistance = resistance;
            combinedObj.attack = attack;
            combinedObj.defence = defence;
        } else
            throw new ValidationError(400, "Could not find CustomCharacter with that _id");

        combinedObj.characterClass_id = characterClass_id + '';
        combinedObj.customCharacter_id = customCharacter_id + '';

        return BattleCharacterModel.create(combinedObj);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return BattleCharacterModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return BattleCharacterModel.find();
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return BattleCharacterModel.deleteOne({_id});
    }
}