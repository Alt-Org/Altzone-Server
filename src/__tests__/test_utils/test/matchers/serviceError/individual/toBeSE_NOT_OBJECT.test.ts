import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_NOT_OBJECT } from '../../../../matchers/serviceError/individual/toBeSE_NOT_OBJECT';

describe('toBeSE_NOT_OBJECT() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError NOT_OBJECT', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_OBJECT });

    const resp = passJestThis(toBeSE_NOT_OBJECT)(validError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason NOT_OBJECT', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = passJestThis(toBeSE_NOT_OBJECT)(otherError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const resp = passJestThis(toBeSE_NOT_OBJECT)({ type: 'not service error' });

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_OBJECT });
    const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(validError).toBeSE_NOT_OBJECT();
    expect(invalidError).not.toBeSE_NOT_OBJECT();
  });
});
