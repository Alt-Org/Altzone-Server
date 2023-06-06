import { Document, ObjectId } from "mongoose";

interface IRaidRoom extends Document{
    _id: ObjectId;
    type: number;
    rowCount: number;
    colCount: number;

    playerData_id: ObjectId;
    clan_id: ObjectId;
}

interface ICreateRaidRoomInput {
    type: IRaidRoom['type'];
    rowCount: IRaidRoom['rowCount'];
    colCount: IRaidRoom['colCount'];

    playerData_id: IRaidRoom['playerData_id'];
    clan_id: IRaidRoom['clan_id'];
}

interface IUpdateRaidRoomInput {
    _id: IRaidRoom['_id'];
    type?: IRaidRoom['type'];
    rowCount?: IRaidRoom['rowCount'];
    colCount?: IRaidRoom['colCount'];

    playerData_id?: IRaidRoom['playerData_id'];
    clan_id?: IRaidRoom['clan_id'];
}

export { IRaidRoom, ICreateRaidRoomInput, IUpdateRaidRoomInput };