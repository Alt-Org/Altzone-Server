import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toContainSE_NOT_DATE } from '../../../../matchers/serviceError/array/toContainSE_NOT_DATE';

describe('toContainSE_NOT_DATE() test suite', () => {
  it('Should return object with pass field set to true if an array contains at least one ServiceError with reason NOT_DATE', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.NOT_DATE }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_NOT_DATE)(arrayWithError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason NOT_DATE', () => {
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_NOT_DATE)(arrayWithoutError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass field set to false if param is not an array', () => {
    const resp = passJestThis(toContainSE_NOT_DATE)('not array');

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.NOT_DATE }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    expect(arrayWithError).toContainSE_NOT_DATE();
    expect(arrayWithoutError).not.toContainSE_NOT_DATE();
  });
});
