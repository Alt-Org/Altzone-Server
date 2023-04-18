import { Document, ObjectId } from "mongoose";

interface IClanFurniture extends Document{
    _id: ObjectId;
    gameId: number;
    name: string;
    shape: string,
    weight: number,
    material: string,
    recycling: string,
    unityKey: string,
    filename: string,
    clanGameId: string,

    clan_id: ObjectId
}

interface ICreateClanFurnitureInput {
    gameId: IClanFurniture['gameId'];
    name: IClanFurniture['name'];
    shape: IClanFurniture['shape'],
    weight: IClanFurniture['weight'],
    material: IClanFurniture['material'],
    recycling: IClanFurniture['recycling'],
    unityKey: IClanFurniture['unityKey'],
    filename: IClanFurniture['filename'],
    clanGameId: IClanFurniture['clanGameId'],

    clan_id: IClanFurniture['clan_id'],
}

interface IUpdateClanFurnitureInput {
    _id: ObjectId;
    gameId?: IClanFurniture['gameId'];
    name?: IClanFurniture['name'];
    shape?: IClanFurniture['shape'],
    weight?: IClanFurniture['weight'],
    material?: IClanFurniture['material'],
    recycling?: IClanFurniture['recycling'],
    unityKey?: IClanFurniture['unityKey'],
    filename?: IClanFurniture['filename'],
    clanGameId?: IClanFurniture['clanGameId'],

    clan_id?: IClanFurniture['clan_id'],
}

export { IClanFurniture, ICreateClanFurnitureInput, IUpdateClanFurnitureInput };