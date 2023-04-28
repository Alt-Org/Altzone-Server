import { Document, ObjectId } from "mongoose";

interface IPlayerData extends Document{
    _id: ObjectId;
    gameId: string;
    name: string;
    backpackCapacity: number;
    uniqueIdentifier: string;
    currentCustomCharacterGameId: string;
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
    _id: IPlayerData['_id'];
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