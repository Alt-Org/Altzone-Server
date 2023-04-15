import { Document, ObjectId } from "mongoose";

interface IPlayerData extends Document{
    _id: ObjectId;
    gameId: Number;
    name: string;
    backpackCapacity: Number;
    uniqueIdentifier: string;
    currentCustomCharacterGameId: int;
    clanGameId: string;

    currentCustomCharacter_id: ObjectId;
    clan_id: ObjectId;
}

interface ICreatePlayerDataInput {
    gameId: IPlayerData['gameId'];
    name: IPlayerData['name'];
    backpackCapacity: IPlayerData['backpackCapacity'];
    uniqueIdentifier: IPlayerData['uniqueIdentifier'];
    currentCustomCharacterGameId: IPlayerData['currentCustomCharacterGameId'];
    clanGameId: IPlayerData['clanGameId'];

    currentCustomCharacter_id: IPlayerData['currentCustomCharacter_id'];
    clan_id: IPlayerData['clan_id'];
}

interface IUpdatePlayerDataInput {
    _id: ObjectId;
    gameId?: IPlayerData['gameId'];
    name?: IPlayerData['name'];
    backpackCapacity?: IPlayerData['backpackCapacity'];
    uniqueIdentifier?: IPlayerData['uniqueIdentifier'];
    currentCustomCharacterGameId?: IPlayerData['currentCustomCharacterGameId'];
    clanGameId?: IPlayerData['clanGameId'];

    currentCustomCharacter_id?: IPlayerData['currentCustomCharacter_id'];
    clan_id?: IPlayerData['clan_id'];
}

export { IPlayerData, ICreatePlayerDataInput, IUpdatePlayerDataInput };