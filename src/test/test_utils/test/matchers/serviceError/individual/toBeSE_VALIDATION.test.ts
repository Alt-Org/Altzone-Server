import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toBeSE_VALIDATION } from "../../../../matchers/serviceError/individual/toBeSE_VALIDATION";

describe('toBeSE_VALIDATION() test suite', () => {  
    it('Should return object with pass equal to true if the object is ServiceError VALIDATION', () => {
        const validError = new ServiceError({ reason: SEReason.VALIDATION });

        const resp = passJestThis(toBeSE_VALIDATION)(validError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass equal to false if the object is ServiceError without reason VALIDATION', () => {
        const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        const resp = passJestThis(toBeSE_VALIDATION)(otherError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
        const resp = passJestThis(toBeSE_VALIDATION)({type: 'not service error'});

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const validError = new ServiceError({ reason: SEReason.VALIDATION });
        const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        expect(validError).toBeSE_VALIDATION();
        expect(invalidError).not.toBeSE_VALIDATION();
    });
});