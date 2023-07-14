import {MongooseError} from "mongoose";
import {IBasicService} from "../interface/IBasicService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {Discriminator} from "../../enum/discriminator.enum";

export abstract class BasicServiceDummyAbstract implements IBasicService{
    protected constructor() {}
    public readonly discriminator = Discriminator.IBasicService;

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    create(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    deleteByCondition(condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    deleteById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readAll(): Promise<Array<object>> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readById(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readOneWithAllCollections(_id: string): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readOneWithCollections(_id: string, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    updateById(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}