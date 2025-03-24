import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_MORE_THAN_MAX } from '../../../../matchers/serviceError/individual/toBeSE_MORE_THAN_MAX';

describe('toBeSE_MORE_THAN_MAX() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError MORE_THAN_MAX', () => {
    const validError = new ServiceError({ reason: SEReason.MORE_THAN_MAX });

    const resp = passJestThis(toBeSE_MORE_THAN_MAX)(validError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason MORE_THAN_MAX', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = passJestThis(toBeSE_MORE_THAN_MAX)(otherError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const resp = passJestThis(toBeSE_MORE_THAN_MAX)({
      type: 'not service error',
    });

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.MORE_THAN_MAX });
    const invalidError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(validError).toBeSE_MORE_THAN_MAX();
    expect(invalidError).not.toBeSE_MORE_THAN_MAX();
  });
});
