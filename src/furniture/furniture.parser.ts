import {FieldParser, IFieldParser} from "../util/parser";

export default class FurnitureParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            Id: "gameId",
            Name: "name",
            Shape: "shape",
            Weight: "weight",
            Material: "material",
            Recycling: "recycling",
            UnityKey: "unityKey",
            Filename: "filename",
            ClanId: "clanGameId",

            clan_id: "clan_id"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "Id",
            name: "Name",
            shape: "Shape",
            weight: "Weight",
            material: "Material",
            recycling: "Recycling",
            unityKey: "UnityKey",
            filename: "Filename",
            clanGameId: "ClanId",

            clan_id: "clan_id",

            Clan: "Clan"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}