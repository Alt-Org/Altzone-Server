import { Document, ObjectId } from "mongoose";

interface IFurniture extends Document{
    _id: ObjectId;
    gameId: string;
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

interface ICreateFurnitureInput {
    gameId: IFurniture['gameId'];
    name: IFurniture['name'];
    shape: IFurniture['shape'],
    weight: IFurniture['weight'],
    material: IFurniture['material'],
    recycling: IFurniture['recycling'],
    unityKey: IFurniture['unityKey'],
    filename: IFurniture['filename'],
    clanGameId?: IFurniture['clanGameId'],

    clan_id?: IFurniture['clan_id'],
}

interface IUpdateFurnitureInput {
    _id: IFurniture['_id'];
    gameId?: IFurniture['gameId'];
    name?: IFurniture['name'];
    shape?: IFurniture['shape'],
    weight?: IFurniture['weight'],
    material?: IFurniture['material'],
    recycling?: IFurniture['recycling'],
    unityKey?: IFurniture['unityKey'],
    filename?: IFurniture['filename'],
    clanGameId?: IFurniture['clanGameId'],

    clan_id?: IFurniture['clan_id'],
}

export { IFurniture, ICreateFurnitureInput, IUpdateFurnitureInput };