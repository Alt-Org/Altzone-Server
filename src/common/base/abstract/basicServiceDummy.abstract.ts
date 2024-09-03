import {MongooseError} from "mongoose";
import {IBasicService} from "../interface/IBasicService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";
import {DeleteOptionsType} from "../type/deleteOptions.type";
import {IgnoreReferencesType} from "../../type/ignoreReferences.type";
import {Discriminator} from "../../enum/discriminator.enum";
import { ModelName } from "../../../common/enum/modelName.enum";
import { IGetAllQuery } from "../../../common/interface/IGetAllQuery";
import {IResponseShape} from "../../interface/IResponseShape";

/**
 * @deprecated 
 */
export abstract class BasicServiceDummyAbstract<T=object> implements IBasicService<T>{
    protected constructor() {}
    public readonly discriminators = [Discriminator.IBasicService];

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    createOne(input: any): Promise<IResponseShape<T> | null | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readAll(query: IGetAllQuery): Promise<IResponseShape<T> | null | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readOneById(_id: string, includeRefs?: ModelName[], metaData?: string[]): Promise<IResponseShape<T> | null | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readOneWithAllCollections(_id: string): Promise<IResponseShape<T> | null | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    readOneWithCollections(_id: string, withQuery: string): Promise<IResponseShape<T> | null | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    updateOneById(input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    deleteOneById(_id: string, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
    deleteByCondition(condition: object, options?: DeleteOptionsType, ignoreReferences?: IgnoreReferencesType): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}