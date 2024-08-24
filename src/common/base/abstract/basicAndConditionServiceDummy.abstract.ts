import {MongooseError} from "mongoose";
import {BasicServiceDummyAbstract} from "./basicServiceDummy.abstract";
import {IBasicService} from "../interface/IBasicService";
import {IConditionService} from "../interface/IConditionService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";
import {Discriminator} from "../../enum/discriminator.enum";

/**
 * @deprecated 
 */
export abstract class BasicAndConditionServiceDummyAbstract<T=object> extends BasicServiceDummyAbstract<T> implements IBasicService<T>, IConditionService<T>{
    protected constructor() {
        super();
    }
    public readonly discriminators = [Discriminator.IBasicService, Discriminator.IConditionService];

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByCondition(condition: object): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithAllCollections(condition: object): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithCollections(condition: object, withQuery: string): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddConditionService')
    public updateOneByCondition(condition: object, input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddConditionService')
    deleteOneByCondition(condition: object): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}