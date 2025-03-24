import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toBeSE_NOT_STRING } from '../../../../matchers/serviceError/individual/toBeSE_NOT_STRING';

describe('toBeSE_NOT_STRING() test suite', () => {
  it('Should return object with pass equal to true if the object is ServiceError NOT_STRING', () => {
    const notStringErr = new ServiceError({ reason: SEReason.NOT_STRING });

    const isError = passJestThis(toBeSE_NOT_STRING)(notStringErr);

    expect(isError.pass).toBeTruthy();
  });

  it('Should return object with pass equal to false if the object is ServiceError without reason NOT_STRING', () => {
    const notAllowedErr = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const isError = passJestThis(toBeSE_NOT_STRING)(notAllowedErr);

    expect(isError.pass).toBeFalsy();
  });

  it('Should return object with pass equal to false if the object is not of type ServiceError', () => {
    const isError = passJestThis(toBeSE_NOT_STRING)({
      type: 'not service error',
    });

    expect(isError.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const notStringErr = new ServiceError({ reason: SEReason.NOT_STRING });
    const notAllowedErr = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    expect(notStringErr).toBeSE_NOT_STRING();
    expect(notAllowedErr).not.toBeSE_NOT_STRING();
  });
});
