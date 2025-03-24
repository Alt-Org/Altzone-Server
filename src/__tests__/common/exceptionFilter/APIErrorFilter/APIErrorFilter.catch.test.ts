import { APIErrorFilter } from "../../../../common/exceptionFilter/APIErrorFilter";
import TestUtilDataFactory from "../../../test_utils/data/TestUtilsDataFactory";

describe('APIErrorFilter.catch() class test suite', () => {
    const filter = new APIErrorFilter();
    const apiErrorBuilder = TestUtilDataFactory.getBuilder('APIError');
    const apiError = apiErrorBuilder
        .setMessage('Something is not right')
        .setStatusCode(400).setValue(null)
        .setField('name').build();

    const jsonMock = jest.fn();
    const responseMock = {
        status: jest.fn((_statusCode: number) => {
            return {
                json: jsonMock
            }
        })
    }

    const hostBuilder = TestUtilDataFactory.getBuilder('ArgumentsHost');
    const host = hostBuilder.setHttpResponse(responseMock).build();

    beforeEach(() => {
        jest.clearAllMocks();
        filter.catch(apiError, host);
    });


    it('Should set status code to response same as in the provided error', () => {
        const expectedCode = apiError.statusCode;

        expect(responseMock.status).toHaveBeenCalledWith(expectedCode);
    });

    it('Should set provided error to json() of response', () => {
        expect(jsonMock).toHaveBeenCalledWith(apiError);
    });
});