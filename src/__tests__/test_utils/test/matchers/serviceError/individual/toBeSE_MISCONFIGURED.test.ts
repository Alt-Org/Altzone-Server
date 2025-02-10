import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toBeSE_MISCONFIGURED } from "../../../../matchers/serviceError/individual/toBeSE_MISCONFIGURED";

describe('toBeSE_MISCONFIGURED() test suite', () => {  
    it('Should return object with pass equal to true if the object is ServiceError MISCONFIGURED', () => {
        const validError = new ServiceError({ reason: SEReason.MISCONFIGURED });

        const resp = passJestThis(toBeSE_MISCONFIGURED)(validError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass equal to false if the object is ServiceError without reason MISCONFIGURED', () => {
        const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        const resp = passJestThis(toBeSE_MISCONFIGURED)(otherError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
        const resp = passJestThis(toBeSE_MISCONFIGURED)({type: 'not service error'});

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const validError = new ServiceError({ reason: SEReason.MISCONFIGURED });
        const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        expect(validError).toBeSE_MISCONFIGURED();
        expect(invalidError).not.toBeSE_MISCONFIGURED();
    });
});