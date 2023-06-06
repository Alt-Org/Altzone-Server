import {FieldParser, IFieldParser} from "../util/parser";

export default class BattleCharacterParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            UnityKey: "unityKey",
            Name: "name",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",

            CharacterClassName: "characterClassName",
            GestaltCycle: "mainDefence",

            CharacterClassId: "characterClass_id",
            CustomCharacterId: "customCharacter_id"
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            unityKey: "UnityKey",
            name: "Name",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",

            characterClassName: "CharacterClassName",
            mainDefence: "GestaltCycle",

            characterClass_id: "CharacterClassId",
            customCharacter_id: "CustomCharacterId",

            CharacterClass: "CharacterClass",
            CustomCharacter: "CustomCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}