import {FieldParser, IFieldParser} from "../util/parser";

export default class RaidRoomParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            Id: "_id",
            Type: "type",
            RowCount: "rowCount",
            ColCount: "colCount",

            PlayerDataId: "playerData_id",
            ClanId: "clan_id"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "Id",
            type: "Type",
            rowCount: "RowCount",
            colCount: "ColCount",

            playerData_id: "PlayerDataId",
            clan_id: "ClanId",

            PlayerData: "PlayerData",
            Clan: "Clan"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}