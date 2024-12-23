import {APIError, isAPIError} from "../../../../common/controller/APIError";

describe('isAPIError() test suite', () => {
    it('Should return true for an instance of APIError', () => {
        const error = new APIError({});
        expect(isAPIError(error)).toBe(true);
    });

    it('Should return true if the first element in an array is an APIError', () => {
        const error = new APIError({});
        expect(isAPIError([error])).toBe(true);
    });

    it('Should return false for a non-APIError object', () => {
        const notAnError = { message: "It is not an APIError" };
        expect(isAPIError(notAnError)).toBe(false);
    });

    it('Should return false for an empty array', () => {
        expect(isAPIError([])).toBe(false);
    });
});