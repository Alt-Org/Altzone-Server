import {FieldParser, IFieldParser} from "../util/parser";

export default class PlayerDataParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Name: "name",
            BackpackCapacity: "backpackCapacity",
            UniqueIdentifier: "uniqueIdentifier",

            clan_id: "clan_id",
            raidRoom_id: "raidRoom_id",
            currentCustomCharacter_id: "currentCustomCharacter_id",
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            name: "Name",
            backpackCapacity: "BackpackCapacity",
            uniqueIdentifier: "UniqueIdentifier",

            clan_id: "clan_id",
            raidRoom_id: "raidRoom_id",
            currentCustomCharacter_id: "currentCustomCharacter_id",

            Clan: "Clan",
            CurrentCustomCharacter: "CurrentCustomCharacter",
            RaidRoom: "RaidRoom",

            CustomCharacter: "CustomCharacters"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}