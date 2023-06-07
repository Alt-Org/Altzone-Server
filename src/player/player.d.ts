import { Document, ObjectId } from "mongoose";

interface IPlayer extends Document{
    _id: ObjectId;
    name: string;
    backpackCapacity: number;
    uniqueIdentifier: string;

    currentCustomCharacter_id: ObjectId;
    clan_id: ObjectId;
    raidRoom_id: ObjectId;
}

interface ICreatePlayerInput {
    name: IPlayer['name'];
    backpackCapacity: IPlayer['backpackCapacity'];
    uniqueIdentifier: IPlayer['uniqueIdentifier'];

    currentCustomCharacter_id?: IPlayer['currentCustomCharacter_id'];
    clan_id?: IPlayer['clan_id'];
    raidRoom_id?: IPlayer['raidRoom_id'];
}

interface IUpdatePlayerInput {
    _id: IPlayer['_id'];
    name?: IPlayer['name'];
    backpackCapacity?: IPlayer['backpackCapacity'];
    uniqueIdentifier?: IPlayer['uniqueIdentifier'];

    currentCustomCharacter_id?: IPlayer['currentCustomCharacter_id'];
    clan_id?: IPlayer['clan_id'];
    raidRoom_id?: IPlayer['raidRoom_id'];
}

export { IPlayer, ICreatePlayerInput, IUpdatePlayerInput };