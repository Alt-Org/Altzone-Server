import {MongooseError} from "mongoose";
import {IConditionService} from "../interface/IConditionService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";
import {Discriminator} from "../../enum/discriminator.enum";

export abstract class ConditionServiceDummyAbstract implements IConditionService{
    protected constructor() {}

    public readonly discriminators = [Discriminator.IConditionService];
    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readByCondition(condition: object): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithAllCollections(condition: object): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public readOneByConditionWithCollections(condition: object, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public updateByCondition(condition: object, input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    public deleteOneByCondition(condition: object): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}