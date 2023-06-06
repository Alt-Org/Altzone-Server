import BattleCharacterModel from "./battleCharacter.model";
import {MongooseError} from "mongoose";
import {IBattleCharacter, ICreateBattleCharacterInput} from "./battleCharacter.d";
import CharacterClassModel from "../characterClass/characterClass.model";
import CustomCharacterModel from "../customCharacter/customCharacter.model";
import ValidationError from "../util/error/validationError";
import Service from "../util/baseAPIClasses/service";

export default class BattleCharacterService extends Service<IBattleCharacter>{
    public constructor(){
        super(BattleCharacterModel);
    }

    public create = async (input: ICreateBattleCharacterInput): Promise<Object | MongooseError> => {
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

            characterClassName: '',
            mainDefence: 0,

            characterClass_id: '',
            customCharacter_id: ''
        };

        if(baseCharacterClass && baseCharacterClass._doc){
            const {name, mainDefence} = baseCharacterClass._doc;
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
}