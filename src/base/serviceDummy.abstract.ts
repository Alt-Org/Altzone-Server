import {IService} from "./interface/IService";
import {MongooseError} from "mongoose";
import {IgnoreReferencesType} from "../util/type/IIgnoreReferencesType";
import {ThrowNotImplementedMethod} from "./decorator/ThrowNotImplementedMethod.decorator";

export abstract class ServiceDummyAbstract implements IService{
    protected constructor() {}

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    create(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    deleteByCondition(condition: object, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    deleteById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    readAll(): Promise<Array<object>> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    readById(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    readOneWithAllCollections(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    readOneWithCollections(_id: string, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ServiceDummyAbstract.name)
    updateById(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

}