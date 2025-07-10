import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_NOT_AUTHORIZED } from '../../../../matchers/serviceError/individual/toBeSE_NOT_AUTHORIZED';

describe('toBeSE_NOT_AUTHORIZED() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError NOT_AUTHORIZED', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_AUTHORIZED });

    const resp = passJestThis(toBeSE_NOT_AUTHORIZED)(validError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason NOT_AUTHORIZED', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = passJestThis(toBeSE_NOT_AUTHORIZED)(otherError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const resp = passJestThis(toBeSE_NOT_AUTHORIZED)({
      type: 'not service error',
    });

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_AUTHORIZED });
    const invalidError = new ServiceError({ reason: SEReason.NOT_AUTHORIZED });

    expect(validError).toBeSE_NOT_AUTHORIZED();
    expect(invalidError).not.toBeSE_NOT_AUTHORIZED();
  });
});
