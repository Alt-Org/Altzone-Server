import { Document, ObjectId } from "mongoose";

interface IRaidRoom extends Document{
    _id: ObjectId;
    gameId: string;
    type: number;
    rowCount: number;
    colCount: number;
    clanMemberGameId: string;
    clanGameId: string;

    playerData_id: ObjectId;
    clan_id: ObjectId;
}

interface ICreateRaidRoomInput {
    gameId: IRaidRoom['gameId'];
    type: IRaidRoom['type'];
    rowCount: IRaidRoom['rowCount'];
    colCount: IRaidRoom['colCount'];
    clanMemberGameId: IRaidRoom['clanMemberGameId'];
    clanGameId: IRaidRoom['clanGameId'];

    playerData_id: IRaidRoom['playerData_id'];
    clan_id: IRaidRoom['clan_id'];
}

interface IUpdateRaidRoomInput {
    _id: IRaidRoom['_id'];
    gameId?: IRaidRoom['gameId'];
    type?: IRaidRoom['type'];
    rowCount?: IRaidRoom['rowCount'];
    colCount?: IRaidRoom['colCount'];
    clanMemberGameId?: IRaidRoom['clanMemberGameId'];
    clanGameId?: IRaidRoom['clanGameId'];

    playerData_id?: IRaidRoom['playerData_id'];
    clan_id?: IRaidRoom['clan_id'];
}

export { IRaidRoom, ICreateRaidRoomInput, IUpdateRaidRoomInput };