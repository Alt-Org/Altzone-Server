import { Send204OnEmptyResInterceptor } from "../../../../../common/interceptor/response/Send204OnEmptyRes";
import TestUtilDataFactory from "../../../../test_utils/data/TestUtilsDataFactory";

describe('Send204OnEmptyResInterceptor class test suite', () => {
    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
    const handlerBuilder = TestUtilDataFactory.getBuilder('CallHandler');
    const responseMock = {
        status: jest.fn().mockReturnThis()
    }
    const context = contextBuilder.setHttpResponse(responseMock).build();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should set response status to 204 if no data returned in response', async () => {
        const nextFn = handlerBuilder
            .setHandleResponse(null)
            .build();

        const interceptor = new Send204OnEmptyResInterceptor();
        const result = await interceptor.intercept(context, nextFn);

        result.subscribe(() => {
            expect(responseMock.status).toHaveBeenCalledTimes(1);
            expect(responseMock.status).toHaveBeenCalledWith(204);
        });
    });

    it('Should not do anything if some data is returned', async () => {
        const nextFn = handlerBuilder.
            setHandleResponse({ name: 'John' })
            .build();

        const interceptor = new Send204OnEmptyResInterceptor();
        const result = await interceptor.intercept(context, nextFn);

        result.subscribe(() => {
            expect(responseMock.status).toHaveBeenCalledTimes(0);
        });
    });
});