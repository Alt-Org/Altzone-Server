import {FieldParser, IFieldParser} from "../util/parser";

export default class CharacterClassParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            CharacterClassId: "gameId",
            Name: "name",
            GestaltCycle: "mainDefence",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "CharacterClassId",
            name: "Name",
            mainDefence: "GestaltCycle",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",

            CustomCharacter: "CustomCharacter",
            BattleCharacter: "BattleCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}