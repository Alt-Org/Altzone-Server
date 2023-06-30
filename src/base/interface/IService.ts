import {MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../../util/type/IIgnoreReferencesType";

export interface IService {
    create(input: any): Promise<object | MongooseError>;
    readById(_id: string): Promise<object | null | MongooseError>;
    readOneWithCollections(_id: string, withQuery: string): Promise<Object | null | MongooseError>;
    readOneWithAllCollections(_id: string): Promise<object | null | MongooseError>;
    readAll(): Promise<Array<object>>;
    updateById(input: any): Promise<object | MongooseError>;
    deleteById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
    deleteByCondition(condition: object, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
}