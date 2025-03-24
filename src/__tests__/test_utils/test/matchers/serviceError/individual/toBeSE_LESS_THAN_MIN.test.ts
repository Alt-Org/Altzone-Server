import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_LESS_THAN_MIN } from '../../../../matchers/serviceError/individual/toBeSE_LESS_THAN_MIN';

describe('toBeSE_LESS_THAN_MIN() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError LESS_THAN_MIN', () => {
    const validError = new ServiceError({ reason: SEReason.LESS_THAN_MIN });

    const resp = passJestThis(toBeSE_LESS_THAN_MIN)(validError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason LESS_THAN_MIN', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = passJestThis(toBeSE_LESS_THAN_MIN)(otherError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const resp = passJestThis(toBeSE_LESS_THAN_MIN)({
      type: 'not service error',
    });

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.LESS_THAN_MIN });
    const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(validError).toBeSE_LESS_THAN_MIN();
    expect(invalidError).not.toBeSE_LESS_THAN_MIN();
  });
});
