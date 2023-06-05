import {FieldParser, IFieldParser} from "../util/parser";

export default class BattleCharacterParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            UnityKey: "unityKey",
            Name: "name",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",
            CustomCharacterId: "customCharacterGameId",

            CharacterClassId: "characterClassGameId",
            CharacterClassName: "characterClassName",
            GestaltCycle: "mainDefence",

            characterClass_id: "characterClass_id",
            customCharacter_id: "customCharacter_id"
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            unityKey: "UnityKey",
            name: "Name",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",
            customCharacterGameId: "CustomCharacterId",

            characterClassGameId: "CharacterClassId",
            characterClassName: "CharacterClassName",
            mainDefence: "GestaltCycle",

            characterClass_id: "characterClass_id",
            customCharacter_id: "customCharacter_id",

            CharacterClass: "CharacterClass",
            CustomCharacter: "CustomCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}