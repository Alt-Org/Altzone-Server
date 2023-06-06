import {FieldParser, IFieldParser} from "../util/parser";

export default class RaidRoomParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Type: "type",
            RowCount: "rowCount",
            ColCount: "colCount",

            playerData_id: "playerData_id",
            clan_id: "clan_id"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            type: "Type",
            rowCount: "RowCount",
            colCount: "ColCount",

            playerData_id: "playerData_id",
            clan_id: "clan_id",

            PlayerData: "PlayerData",
            Clan: "Clan"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}