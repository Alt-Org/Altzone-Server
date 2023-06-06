import { Document, ObjectId } from "mongoose";

interface IPlayerData extends Document{
    _id: ObjectId;
    name: string;
    backpackCapacity: number;
    uniqueIdentifier: string;

    currentCustomCharacter_id: ObjectId;
    clan_id: ObjectId;
    raidRoom_id: ObjectId;
}

interface ICreatePlayerDataInput {
    name: IPlayerData['name'];
    backpackCapacity: IPlayerData['backpackCapacity'];
    uniqueIdentifier: IPlayerData['uniqueIdentifier'];

    currentCustomCharacter_id?: IPlayerData['currentCustomCharacter_id'];
    clan_id?: IPlayerData['clan_id'];
    raidRoom_id?: IPlayerData['raidRoom_id'];
}

interface IUpdatePlayerDataInput {
    _id: IPlayerData['_id'];
    name?: IPlayerData['name'];
    backpackCapacity?: IPlayerData['backpackCapacity'];
    uniqueIdentifier?: IPlayerData['uniqueIdentifier'];

    currentCustomCharacter_id?: IPlayerData['currentCustomCharacter_id'];
    clan_id?: IPlayerData['clan_id'];
    raidRoom_id?: IPlayerData['raidRoom_id'];
}

export { IPlayerData, ICreatePlayerDataInput, IUpdatePlayerDataInput };