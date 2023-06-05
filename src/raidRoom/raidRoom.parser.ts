import {FieldParser, IFieldParser} from "../util/parser";

export default class RaidRoomParser extends FieldParser implements IFieldParser{
    public constructor() {
        const gameToAPIDictionary: Record<string, string> = {
            _id: "_id",
            Id: "gameId",
            Type: "type",
            RowCount: "rowCount",
            ColCount: "colCount",
            ClanMemberId: "clanMemberGameId",
            ClanId: "clanGameId",

            playerData_id: "playerData_id",
            clan_id: "clan_id"
        };

        const apiToGameDictionary: Record<string, string> = {
            _id: "_id",
            gameId: "Id",
            type: "Type",
            rowCount: "RowCount",
            colCount: "ColCount",
            clanMemberGameId: "ClanMemberId",

            playerData_id: "playerData_id",
            clan_id: "clan_id",

            PlayerData: "PlayerData",
            Clan: "Clan"
        };

        super(gameToAPIDictionary, apiToGameDictionary);
    }
}