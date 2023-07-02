import {IService} from "./interface/IService";
import {MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {ThrowNotImplementedMethod} from "./decorator/ThrowNotImplementedMethod";

export abstract class IServiceDummy implements IService{
    protected constructor() {}

    @ThrowNotImplementedMethod(IServiceDummy.name)
    create(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    deleteByCondition(condition: object, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    deleteById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    readAll(): Promise<Array<object>> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    readById(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    readOneWithAllCollections(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    readOneWithCollections(_id: string, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(IServiceDummy.name)
    updateById(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

}