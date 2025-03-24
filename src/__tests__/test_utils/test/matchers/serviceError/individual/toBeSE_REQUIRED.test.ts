import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_REQUIRED } from '../../../../matchers/serviceError/individual/toBeSE_REQUIRED';

describe('toBeSE_REQUIRED() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError REQUIRED', () => {
    const validError = new ServiceError({ reason: SEReason.REQUIRED });

    const resp = passJestThis(toBeSE_REQUIRED)(validError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason REQUIRED', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = passJestThis(toBeSE_REQUIRED)(otherError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const resp = passJestThis(toBeSE_REQUIRED)({ type: 'not service error' });

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.REQUIRED });
    const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(validError).toBeSE_REQUIRED();
    expect(invalidError).not.toBeSE_REQUIRED();
  });
});
