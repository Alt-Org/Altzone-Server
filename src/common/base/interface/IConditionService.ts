import {MongooseError} from "mongoose";

export interface IConditionService {
    readByCondition(condition: {}): Promise<object | null | MongooseError>;
    readOneByConditionWithCollections(condition: {}, withQuery: string): Promise<Object | null | MongooseError>;
    readOneByConditionWithAllCollections(condition: {}): Promise<object | null | MongooseError>;

    updateByCondition(condition: {}, input: any): Promise<object | MongooseError>;
}