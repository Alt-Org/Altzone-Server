import {FieldParser, IFieldParser} from "../util/parser";

export default class FurnitureParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Name: "name",
            Shape: "shape",
            Weight: "weight",
            Material: "material",
            Recycling: "recycling",
            UnityKey: "unityKey",
            Filename: "filename",

            clan_id: "clan_id"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            name: "Name",
            shape: "Shape",
            weight: "Weight",
            material: "Material",
            recycling: "Recycling",
            unityKey: "UnityKey",
            filename: "Filename",

            clan_id: "clan_id",

            Clan: "Clan"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}