import {FieldParser, IFieldParser} from "../util/parser";

export default class ClanParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            Id: "gameId",
            Name: "name",
            Tag: "tag",
            GameCoins: "gameCoins"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "Id",
            name: "Name",
            tag: "Tag",
            gameCoins: "GameCoins",

            PlayerData: "PlayerDatas",
            RaidRoom: "RaidRooms",
            Furniture: "Furnitures"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}