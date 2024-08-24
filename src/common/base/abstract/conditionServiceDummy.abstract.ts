import {MongooseError} from "mongoose";
import {IConditionService} from "../interface/IConditionService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";
import {Discriminator} from "../../enum/discriminator.enum";

/**
 * @deprecated 
 */
export abstract class ConditionServiceDummyAbstract<T=object> implements IConditionService<T>{
    protected constructor() {}

    public readonly discriminators = [Discriminator.IConditionService];
    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByCondition(condition: object): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithAllCollections(condition: object): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithCollections(condition: object, withQuery: string): Promise<T | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public updateOneByCondition(condition: object, input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public deleteOneByCondition(condition: object): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}