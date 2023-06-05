import {FieldParser, IFieldParser} from "../util/parser";

export default class PlayerDataParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            Id: "gameId",
            Name: "name",
            BackpackCapacity: "backpackCapacity",
            UniqueIdentifier: "uniqueIdentifier",
            ClanId: "clanGameId",
            CurrentCustomCharacterId: "currentCustomCharacterGameId",

            clan_id: "clan_id",
            raidRoom_id: "raidRoom_id",
            currentCustomCharacter_id: "currentCustomCharacter_id",
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "Id",
            name: "Name",
            backpackCapacity: "BackpackCapacity",
            uniqueIdentifier: "UniqueIdentifier",
            clanGameId: "ClanId",
            currentCustomCharacterGameId: "CurrentCustomCharacterId",

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