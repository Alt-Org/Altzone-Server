import {MongooseError} from "mongoose";
import IDiscriminator from "../../interface/IDiscriminator";

export interface IConditionService<T=object> extends IDiscriminator{
    readOneByCondition(condition: object): Promise<T | null | MongooseError>;
    readOneByConditionWithCollections(condition: object, withQuery: string): Promise<T | null | MongooseError>;
    readOneByConditionWithAllCollections(condition: object): Promise<T | null | MongooseError>;

    updateOneByCondition(condition: object, input: any): Promise<object | MongooseError>;
    deleteOneByCondition(condition: object): Promise<object | MongooseError>;
}