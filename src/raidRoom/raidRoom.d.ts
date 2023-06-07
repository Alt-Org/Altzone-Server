import { Document, ObjectId } from "mongoose";

interface IRaidRoom extends Document{
    _id: ObjectId;
    type: number;
    rowCount: number;
    colCount: number;

    player_id: ObjectId;
    clan_id: ObjectId;
}

interface ICreateRaidRoomInput {
    type: IRaidRoom['type'];
    rowCount: IRaidRoom['rowCount'];
    colCount: IRaidRoom['colCount'];

    player_id: IRaidRoom['player_id'];
    clan_id: IRaidRoom['clan_id'];
}

interface IUpdateRaidRoomInput {
    _id: IRaidRoom['_id'];
    type?: IRaidRoom['type'];
    rowCount?: IRaidRoom['rowCount'];
    colCount?: IRaidRoom['colCount'];

    player_id?: IRaidRoom['player_id'];
    clan_id?: IRaidRoom['clan_id'];
}

export { IRaidRoom, ICreateRaidRoomInput, IUpdateRaidRoomInput };