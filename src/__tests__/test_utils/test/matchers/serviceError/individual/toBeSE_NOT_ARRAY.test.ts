import { SEReason } from "../../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../../common/service/basicService/ServiceError";
import passJestThis from "../../../../jest_util/passJestThisObject";
import { toBeSE_NOT_ARRAY } from "../../../../matchers/serviceError/individual/toBeSE_NOT_ARRAY";

describe('toBeSE_NOT_ARRAY() test suite', () => {  
    it('Should return object with pass equal to true if the object is ServiceError NOT_ARRAY', () => {
        const validError = new ServiceError({ reason: SEReason.NOT_ARRAY });

        const resp = passJestThis(toBeSE_NOT_ARRAY)(validError);

        expect(resp.pass).toBeTruthy();
    });

    it('Should return object with pass equal to false if the object is ServiceError without reason NOT_ARRAY', () => {
        const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        const resp = passJestThis(toBeSE_NOT_ARRAY)(otherError);

        expect(resp.pass).toBeFalsy();
    });

    it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
        const resp = passJestThis(toBeSE_NOT_ARRAY)({type: 'not service error'});

        expect(resp.pass).toBeFalsy();
    });

    it('Should be properly registered as a custom jest matcher', () => {
        const validError = new ServiceError({ reason: SEReason.NOT_ARRAY });
        const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

        expect(validError).toBeSE_NOT_ARRAY();
        expect(invalidError).not.toBeSE_NOT_ARRAY();
    });
});