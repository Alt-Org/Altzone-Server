import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toBeSE_WRONG_ENUM } from "../../../../matchers/serviceError/individual/toBeSE_WRONG_ENUM";

describe('toBeSE_WRONG_ENUM() test suite', () => {  
    it('Should return object with pass equal to true if the object is ServiceError WRONG_ENUM', () => {
        const validError = new ServiceError({ reason: SEReason.WRONG_ENUM });

        const resp = passJestThis(toBeSE_WRONG_ENUM)(validError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass equal to false if the object is ServiceError without reason WRONG_ENUM', () => {
        const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        const resp = passJestThis(toBeSE_WRONG_ENUM)(otherError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
        const resp = passJestThis(toBeSE_WRONG_ENUM)({type: 'not service error'});

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const validError = new ServiceError({ reason: SEReason.WRONG_ENUM });
        const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        expect(validError).toBeSE_WRONG_ENUM();
        expect(invalidError).not.toBeSE_WRONG_ENUM();
    });
});