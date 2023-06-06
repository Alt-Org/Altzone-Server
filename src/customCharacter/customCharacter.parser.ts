import {FieldParser, IFieldParser} from "../util/parser";

export default class CustomCharacterParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            UnityKey: "unityKey",
            Name: "name",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",

            characterClass_id: "characterClass_id",
            playerData_id: "playerData_id"
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            unityKey: "UnityKey",
            name: "Name",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",

            characterClass_id: "characterClass_id",
            playerData_id: "playerData_id",

            CharacterClass: "CharacterClass",
            PlayerData: "PlayerData",
            BattleCharacter: "BattleCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}