import {MongooseError} from "mongoose";
import {IConditionService} from "../interface/IConditionService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";

export abstract class ConditionServiceDummyAbstract implements IConditionService{
    protected constructor() {}

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    readByCondition(condition: {}): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    readOneByConditionWithAllCollections(condition: {}): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    readOneByConditionWithCollections(condition: {}, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(ConditionServiceDummyAbstract.name, 'AddConditionService')
    updateByCondition(condition: {}, input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}