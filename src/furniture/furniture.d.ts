import { Document, ObjectId } from "mongoose";

interface IFurniture extends Document{
    _id: ObjectId;
    name: string;
    shape: string,
    weight: number,
    material: string,
    recycling: string,
    unityKey: string,
    filename: string,

    clan_id: ObjectId
}

interface ICreateFurnitureInput {
    name: IFurniture['name'];
    shape: IFurniture['shape'],
    weight: IFurniture['weight'],
    material: IFurniture['material'],
    recycling: IFurniture['recycling'],
    unityKey: IFurniture['unityKey'],
    filename: IFurniture['filename'],

    clan_id: IFurniture['clan_id'],
}

interface IUpdateFurnitureInput {
    _id: IFurniture['_id'];
    name?: IFurniture['name'];
    shape?: IFurniture['shape'],
    weight?: IFurniture['weight'],
    material?: IFurniture['material'],
    recycling?: IFurniture['recycling'],
    unityKey?: IFurniture['unityKey'],
    filename?: IFurniture['filename'],

    clan_id?: IFurniture['clan_id'],
}

export { IFurniture, ICreateFurnitureInput, IUpdateFurnitureInput };