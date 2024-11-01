import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toBeSE_UNEXPECTED } from "../../../../matchers/serviceError/individual/toBeSE_UNEXPECTED";

describe('toBeSE_UNEXPECTED() test suite', () => {  
    it('Should return object with pass equal to true if the object is ServiceError UNEXPECTED', () => {
        const validError = new ServiceError({ reason: SEReason.UNEXPECTED });

        const resp = passJestThis(toBeSE_UNEXPECTED)(validError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass equal to false if the object is ServiceError without reason UNEXPECTED', () => {
        const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        const resp = passJestThis(toBeSE_UNEXPECTED)(otherError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
        const resp = passJestThis(toBeSE_UNEXPECTED)({type: 'not service error'});

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const validError = new ServiceError({ reason: SEReason.UNEXPECTED });
        const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        expect(validError).toBeSE_UNEXPECTED();
        expect(invalidError).not.toBeSE_UNEXPECTED();
    });
});