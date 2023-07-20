import {MongooseError} from "mongoose";
import IDiscriminator from "../../interface/IDiscriminator";

export interface IConditionService extends IDiscriminator{
    readOneByCondition(condition: object): Promise<object | null | MongooseError>;
    readOneByConditionWithCollections(condition: object, withQuery: string): Promise<Object | null | MongooseError>;
    readOneByConditionWithAllCollections(condition: object): Promise<object | null | MongooseError>;

    updateOneByCondition(condition: object, input: any): Promise<object | MongooseError>;
    deleteOneByCondition(condition: object): Promise<object | MongooseError>;
}