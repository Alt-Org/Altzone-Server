import BodyBuilder from "./BodyBuilder";
import CallHandlerBuilder from "./CallHandlerBuilder";
import ExecutionContextBuilder from "./ExecutionContextBuilder";
import RequestBuilder from "./RequestBuilder";


type BuilderName = 
    'Body' | 'Request' | 
    'ExecutionContext' | 'CallHandler';

type BuilderMap = {
    Body: BodyBuilder,
    Request: RequestBuilder,

    ExecutionContext: ExecutionContextBuilder,
    CallHandler: CallHandlerBuilder
};

export default class TestUtilDataFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'Body':
                return new BodyBuilder() as BuilderMap[T];
            case 'Request':
                return new RequestBuilder() as BuilderMap[T];
            case 'ExecutionContext':
                return new ExecutionContextBuilder() as BuilderMap[T];
            case 'CallHandler':
                return new CallHandlerBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}