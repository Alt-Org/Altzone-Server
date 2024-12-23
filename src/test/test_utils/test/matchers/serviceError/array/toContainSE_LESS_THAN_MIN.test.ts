import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toContainSE_LESS_THAN_MIN } from "../../../../matchers/serviceError/array/toContainSE_LESS_THAN_MIN";

describe('toContainSE_LESS_THAN_MIN() test suite', () => {
    it('Should return object with pass field set to true if an array contains at least one ServiceError with reason LESS_THAN_MIN', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.LESS_THAN_MIN }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_LESS_THAN_MIN)(arrayWithError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason LESS_THAN_MIN', () => {
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_LESS_THAN_MIN)(arrayWithoutError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass field set to false if param is not an array', () => {
        const resp = passJestThis(toContainSE_LESS_THAN_MIN)('not array');

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.LESS_THAN_MIN }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        expect(arrayWithError).toContainSE_LESS_THAN_MIN();
        expect(arrayWithoutError).not.toContainSE_LESS_THAN_MIN();
    });
});