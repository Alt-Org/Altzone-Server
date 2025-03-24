import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_NOT_FOUND } from '../../../../matchers/serviceError/individual/toBeSE_NOT_FOUND';

describe('toBeSE_NOT_FOUND() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError NOT_FOUND', () => {
    const notFoundErr = new ServiceError({ reason: SEReason.NOT_FOUND });

    const isError = passJestThis(toBeSE_NOT_FOUND)(notFoundErr);

    expect(isError.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason NOT_FOUND', () => {
    const notAllowedErr = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const isError = passJestThis(toBeSE_NOT_FOUND)(notAllowedErr);

    expect(isError.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const isError = passJestThis(toBeSE_NOT_FOUND)({
      type: 'not service error',
    });

    expect(isError.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const notFoundErr = new ServiceError({ reason: SEReason.NOT_FOUND });
    const notAllowedErr = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(notFoundErr).toBeSE_NOT_FOUND();
    expect(notAllowedErr).not.toBeSE_NOT_FOUND();
  });
});
