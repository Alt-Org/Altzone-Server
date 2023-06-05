import {FieldParser, IFieldParser} from "../util/parser";

export default class CustomCharacterParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            Id: "gameId",
            UnityKey: "unityKey",
            Name: "name",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",
            CharacterClassId: "characterClassGameId",
            PlayerDataId: "playerDataGameId",

            characterClass_id: "characterClass_id",
            playerData_id: "playerData_id"
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "Id",
            unityKey: "UnityKey",
            name: "Name",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",
            characterClassGameId: "CharacterClassId",
            playerDataGameId: "PlayerDataId",

            characterClass_id: "characterClass_id",
            playerData_id: "playerData_id",

            CharacterClass: "CharacterClass",
            PlayerData: "PlayerData",
            BattleCharacter: "BattleCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}