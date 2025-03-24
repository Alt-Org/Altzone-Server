import { SEReason } from '../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../common/service/basicService/ServiceError';
import { isErrorWithReason } from '../../../matchers/serviceError/isErrorWithReason';

describe('isErrorWithReason() test suite', () => {
  it('Should return true if the error is ServiceError and has the provided reason', () => {
    const reason = SEReason.NOT_FOUND;
    const notFoundError = new ServiceError({ reason });

    const resp = isErrorWithReason(notFoundError, reason);

    expect(resp).toBeTruthy();
  });

  it('Should return false if the error is ServiceError but has other reason', () => {
    const reason = SEReason.NOT_FOUND;
    const notAllowed = new ServiceError({ reason: SEReason.NOT_ALLOWED });

    const resp = isErrorWithReason(notAllowed, reason);

    expect(resp).toBeFalsy();
  });

  it('Should return false if the error is not of type ServiceError', () => {
    const resp = isErrorWithReason(
      { type: 'not service error' },
      SEReason.NOT_ALLOWED,
    );

    expect(resp).toBeFalsy();
  });
});
