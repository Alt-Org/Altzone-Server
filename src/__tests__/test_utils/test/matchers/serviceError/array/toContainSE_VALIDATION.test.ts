import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toContainSE_VALIDATION } from '../../../../matchers/serviceError/array/toContainSE_VALIDATION';

describe('toContainSE_VALIDATION() test suite', () => {
  it('Should return object with pass field set to true if an array contains at least one ServiceError with reason VALIDATION', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.VALIDATION }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_VALIDATION)(arrayWithError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason VALIDATION', () => {
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_VALIDATION)(arrayWithoutError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass field set to false if param is not an array', () => {
    const resp = passJestThis(toContainSE_VALIDATION)('not array');

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.VALIDATION }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    expect(arrayWithError).toContainSE_VALIDATION();
    expect(arrayWithoutError).not.toContainSE_VALIDATION();
  });
});
