import { ValidationExceptionFilter } from "../../../../common/exceptionFilter/ValidationExceptionFilter";
import TestUtilDataFactory from "../../../test_utils/data/TestUtilsDataFactory";

describe('ValidationExceptionFilter.catch() class test suite', () => {
    let filter = new ValidationExceptionFilter();

    const validationErrorBuilder = TestUtilDataFactory.getBuilder('ValidationError');
    const validationError = validationErrorBuilder
        .addConstraint('isBoolean', 'The value must be of boolean type')
        .setProperty('name')
        .setValue('hello')
        .build();
    const errors = [validationError];

    const errorBuilder = TestUtilDataFactory.getBuilder('BadRequestException');
    const error = errorBuilder
        .setResponse({ statusCode: 400, message: 'Bad request', error: 'Validation error', errors })
        .build();

    const jsonMock = jest.fn();
    const responseMock = {
        status: jest.fn((statusCode: number) => {
            return {
                json: jsonMock
            }
        })
    }

    const hostBuilder = TestUtilDataFactory.getBuilder('ArgumentsHost');
    const host = hostBuilder.setHttpResponse(responseMock).build();

    beforeEach(() => {
        jest.clearAllMocks();
        filter.catch(error, host);
    });


    it('Should set status code to response same as in the provided error', () => {
        const expectedCode = error.getStatus();

        expect(responseMock.status).toHaveBeenCalledWith(expectedCode);
    });

    it('Should set converted from ValidationError to APIError error to json() of response', () => {
        const apiErrorBuilder = TestUtilDataFactory.getBuilder('APIError');
        const expectedError = apiErrorBuilder
            .setMessage('The value must be of boolean type')
            .setField('name')
            .setValue('hello')
            .setAdditional('isBoolean')
            .build();

        expect(jsonMock).toHaveBeenCalledWith({
            statusCode: error.getStatus(),
            errors: [
                expectedError
            ]
        });
    });
});