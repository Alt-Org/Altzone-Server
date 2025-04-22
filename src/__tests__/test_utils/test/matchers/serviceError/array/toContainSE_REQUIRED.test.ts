import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toContainSE_REQUIRED } from '../../../../matchers/serviceError/array/toContainSE_REQUIRED';

describe('toContainSE_REQUIRED() test suite', () => {
  it('Should return object with pass field set to true if an array contains at least one ServiceError with reason REQUIRED', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.REQUIRED }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_REQUIRED)(arrayWithError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason REQUIRED', () => {
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_REQUIRED)(arrayWithoutError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass field set to false if param is not an array', () => {
    const resp = passJestThis(toContainSE_REQUIRED)('not array');

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.REQUIRED }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    expect(arrayWithError).toContainSE_REQUIRED();
    expect(arrayWithoutError).not.toContainSE_REQUIRED();
  });
});
