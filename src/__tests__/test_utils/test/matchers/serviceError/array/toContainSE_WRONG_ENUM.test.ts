import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toContainSE_WRONG_ENUM } from "../../../../matchers/serviceError/array/toContainSE_WRONG_ENUM";

describe('toContainSE_WRONG_ENUM() test suite', () => {
    it('Should return object with pass field set to true if an array contains at least one ServiceError with reason WRONG_ENUM', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.WRONG_ENUM }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_WRONG_ENUM)(arrayWithError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason WRONG_ENUM', () => {
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        const resp = passJestThis(toContainSE_WRONG_ENUM)(arrayWithoutError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass field set to false if param is not an array', () => {
        const resp = passJestThis(toContainSE_WRONG_ENUM)('not array');

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const arrayWithError = [ 
            new ServiceError({ reason: SEReason.WRONG_ENUM }), 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];
        const arrayWithoutError = [ 
            new ServiceError({ reason: SEReason.NOT_ALLOWED }),  
            { type: 'not error' }
        ];

        expect(arrayWithError).toContainSE_WRONG_ENUM();
        expect(arrayWithoutError).not.toContainSE_WRONG_ENUM();
    });
});