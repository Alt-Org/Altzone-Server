import {FieldParser, IFieldParser} from "../util/parser";

export default class PlayerDataParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Name: "name",
            BackpackCapacity: "backpackCapacity",
            UniqueIdentifier: "uniqueIdentifier",

            ClanId: "clan_id",
            RaidRoomId: "raidRoom_id",
            CurrentCustomCharacterId: "currentCustomCharacter_id",
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            name: "Name",
            backpackCapacity: "BackpackCapacity",
            uniqueIdentifier: "UniqueIdentifier",

            clan_id: "ClanId",
            raidRoom_id: "RaidRoomId",
            currentCustomCharacter_id: "CurrentCustomCharacterId",

            Clan: "Clan",
            CurrentCustomCharacter: "CurrentCustomCharacter",
            RaidRoom: "RaidRoom",

            CustomCharacter: "CustomCharacters"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}