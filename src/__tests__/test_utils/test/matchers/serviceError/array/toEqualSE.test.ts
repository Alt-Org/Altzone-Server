import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toEqualSE } from "../../../../matchers/serviceError/array/toEqualSE";

describe('toEqualSE() test suite', () => {
    it('Should return object with pass field set to true if all objects are ServiceErrors with specified reasons', () => {
        const errorsToFind = [ SEReason.NOT_ALLOWED, SEReason.NOT_ARRAY, SEReason.MISCONFIGURED ];
        const inputArray = [
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),
            new ServiceError({ reason: SEReason.NOT_ARRAY }),
            new ServiceError({ reason: SEReason.MISCONFIGURED })
        ];

        const resp = passJestThis(toEqualSE)(inputArray, errorsToFind);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass field set to false if not all objects are ServiceErrors with specified reasons', () => {
        const errorsToFind = [ SEReason.NOT_ALLOWED, SEReason.NOT_ARRAY, SEReason.MISCONFIGURED ];
        const inputArray = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),
            new ServiceError({ reason: SEReason.MISCONFIGURED }),
            456 
        ];

        const resp = passJestThis(toEqualSE)(inputArray, errorsToFind);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass field set to false if provided param is not an array', () => {
        const errorsToFind = [ SEReason.NOT_ALLOWED, SEReason.NOT_ARRAY, SEReason.MISCONFIGURED ];
        const resp = passJestThis(toEqualSE)(45, errorsToFind);

        expect(resp.pass).toBeFalsy();
    });

    it('Should throw TypeError if the expected value is not array with SEReasons', () => {
        const receivedErrors = [new ServiceError({ reason: SEReason.NOT_ALLOWED })];

        expect(() => passJestThis(toEqualSE)(receivedErrors, ['not reason', 34])).toThrow(new TypeError("The expected value must be array of SEReasons"));
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const errorsToFind = [ SEReason.NOT_ALLOWED, SEReason.NOT_ARRAY, SEReason.MISCONFIGURED ];
        const inputArray = [
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),
            new ServiceError({ reason: SEReason.NOT_ARRAY }),
            new ServiceError({ reason: SEReason.MISCONFIGURED })
        ];

        expect(inputArray).toEqualSE(errorsToFind);
    });

    it('Should be properly registered as a custom jest matcher for "not"', () => {
        const errorsNotToFind = [ SEReason.NOT_ALLOWED, SEReason.NOT_ARRAY, SEReason.MISCONFIGURED ];
        const inputArray = [ 23, {type: 'not error'}, 'some str' ];

        expect(inputArray).not.toEqualSE(errorsNotToFind);
    });
});