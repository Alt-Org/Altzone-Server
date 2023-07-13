import {MongooseError} from "mongoose";
import {BasicServiceDummyAbstract} from "./basicServiceDummy.abstract";
import {IBasicService} from "../interface/IBasicService";
import {IConditionService} from "../interface/IConditionService";
import {ThrowNotImplementedMethod} from "../decorator/ThrowNotImplementedMethod.decorator";

export abstract class BasicAndConditionServiceDummyAbstract extends BasicServiceDummyAbstract implements IBasicService, IConditionService{
    protected constructor() {
        super();
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddBaseService')
    readByCondition(condition: {}): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddBaseService')
    readOneByConditionWithAllCollections(condition: {}): Promise<object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddBaseService')
    readOneByConditionWithCollections(condition: {}, withQuery: string): Promise<Object | MongooseError | null> {
        return Promise.resolve(undefined);
    }

    @ThrowNotImplementedMethod(BasicAndConditionServiceDummyAbstract.name, 'AddBaseService')
    updateByCondition(condition: {}, input: any): Promise<object | MongooseError> {
        return Promise.resolve(undefined);
    }
}