import { Types } from "mongoose";

export interface IMetaService<T=any> {
    createMetaData(newMetaData: Partial<T>): Promise<T | null>;
    readMetaData(_id: string | Types.ObjectId): Promise<T | null>;
    deleteMetaData(_id: string | Types.ObjectId): Promise<boolean>;
}