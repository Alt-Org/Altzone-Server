import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_NOT_ALLOWED } from '../../../../matchers/serviceError/individual/toBeSE_NOT_ALLOWED';

describe('toBeSE_NOT_ALLOWED() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError NOT_ALLOWED', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const isError = passJestThis(toBeSE_NOT_ALLOWED)(validError);

    expect(isError.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason NOT_ALLOWED', () => {
    const otherError = new ServiceError({ reason: SEReason.NOT_ARRAY });

    const isError = passJestThis(toBeSE_NOT_ALLOWED)(otherError);

    expect(isError.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const isError = passJestThis(toBeSE_NOT_ALLOWED)({
      type: 'not service error',
    });

    expect(isError.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const validError = new ServiceError({ reason: SEReason.NOT_ALLOWED });
    const otherError = new ServiceError({ reason: SEReason.NOT_FOUND });

    expect(validError).toBeSE_NOT_ALLOWED();
    expect(otherError).not.toBeSE_NOT_ALLOWED();
  });
});
