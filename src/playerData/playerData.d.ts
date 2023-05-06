import { Document, ObjectId } from "mongoose";

interface IPlayerData extends Document{
    _id: ObjectId;
    gameId: string;
    name: string;
    backpackCapacity: number;
    uniqueIdentifier: string;
    currentCustomCharacterGameId: string;
    clanGameId: string;
    raidRoomGameId: string;

    currentCustomCharacter_id: ObjectId;
    clan_id: ObjectId;
    raidRoom_id: ObjectId;
}

interface ICreatePlayerDataInput {
    gameId: IPlayerData['gameId'];
    name: IPlayerData['name'];
    backpackCapacity: IPlayerData['backpackCapacity'];
    uniqueIdentifier: IPlayerData['uniqueIdentifier'];
    currentCustomCharacterGameId?: IPlayerData['currentCustomCharacterGameId'];
    clanGameId?: IPlayerData['clanGameId'];
    raidRoomGameId?: IPlayerData['raidRoomGameId'];

    currentCustomCharacter_id?: IPlayerData['currentCustomCharacter_id'];
    clan_id?: IPlayerData['clan_id'];
    raidRoom_id?: IPlayerData['raidRoom_id'];
}

interface IUpdatePlayerDataInput {
    _id: IPlayerData['_id'];
    gameId?: IPlayerData['gameId'];
    name?: IPlayerData['name'];
    backpackCapacity?: IPlayerData['backpackCapacity'];
    uniqueIdentifier?: IPlayerData['uniqueIdentifier'];
    currentCustomCharacterGameId?: IPlayerData['currentCustomCharacterGameId'];
    raidRoomGameId?: IPlayerData['raidRoomGameId'];

    currentCustomCharacter_id?: IPlayerData['currentCustomCharacter_id'];
    clan_id?: IPlayerData['clan_id'];
    raidRoom_id?: IPlayerData['raidRoom_id'];
}

export { IPlayerData, ICreatePlayerDataInput, IUpdatePlayerDataInput };