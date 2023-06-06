import {FieldParser, IFieldParser} from "../util/parser";

export default class ClanParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Name: "name",
            Tag: "tag",
            GameCoins: "gameCoins"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
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