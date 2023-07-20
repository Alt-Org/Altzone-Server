import {MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import IDiscriminator from "../../interface/IDiscriminator";

export interface IBasicService extends IDiscriminator{
    createOne(input: any): Promise<object | MongooseError>;

    readOneById(_id: string): Promise<object | null | MongooseError>;
    readOneWithCollections(_id: string, withQuery: string): Promise<Object | null | MongooseError>;
    readOneWithAllCollections(_id: string): Promise<object | null | MongooseError>;
    readAll(): Promise<Array<object>>;

    updateOneById(input: any): Promise<object | MongooseError>;

    deleteOneById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
    deleteByCondition(condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
}