import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toContainSE_MORE_THAN_MAX } from "../../../../matchers/serviceError/array/toContainSE_MORE_THAN_MAX";

describe('toContainSE_MORE_THAN_MAX() test suite', () => {
    it('Should return object with pass field set to true if an array contains at least one ServiceError with reason MORE_THAN_MAX', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.MORE_THAN_MAX }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_MORE_THAN_MAX)(arrayWithError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason MORE_THAN_MAX', () => {
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_MORE_THAN_MAX)(arrayWithoutError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass field set to false if param is not an array', () => {
        const resp = passJestThis(toContainSE_MORE_THAN_MAX)('not array');

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.MORE_THAN_MAX }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        expect(arrayWithError).toContainSE_MORE_THAN_MAX();
        expect(arrayWithoutError).not.toContainSE_MORE_THAN_MAX();
    });
});