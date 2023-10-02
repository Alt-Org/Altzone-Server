import {MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import IDiscriminator from "../../interface/IDiscriminator";
import { ModelName } from "src/common/enum/modelName.enum";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";

export interface IBasicService<T=object> extends IDiscriminator{
    createOne(input: any): Promise<T | MongooseError | null>;
    createOnePreHook?(input: any): Promise<boolean>;
    createOnePostHook?(input: any, output: any): Promise<boolean>;

    readOneById(_id: string, includeRefs?: ModelName[], metaData?: string[]): Promise<T | null | MongooseError>;
    readOneWithCollections(_id: string, withQuery: string): Promise<T | null | MongooseError>;
    readOneWithAllCollections(_id: string): Promise<T | null | MongooseError>;
    readAll(query: IGetAllQuery): Promise<Array<T>>;

    updateOneById(input: any): Promise<object | MongooseError>;

    deleteOneById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
    deleteByCondition(condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError>;
}