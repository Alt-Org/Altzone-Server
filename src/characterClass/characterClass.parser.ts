import {FieldParser, IFieldParser} from "../util/parser";

export default class CharacterClassParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Name: "name",
            GestaltCycle: "mainDefence",
            Speed: "speed",
            Resistance: "resistance",
            Attack: "attack",
            Defence: "defence",
        }

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            name: "Name",
            mainDefence: "GestaltCycle",
            speed: "Speed",
            resistance: "Resistance",
            attack: "Attack",
            defence: "Defence",

            CustomCharacter: "CustomCharacters",
            BattleCharacter: "BattleCharacter"
        }

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}