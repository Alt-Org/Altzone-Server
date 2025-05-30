import { SEReason } from '../../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../../common/service/basicService/ServiceError';
import passJestThis from '../../../../jest_util/passJestThisObject';
import { toContainSE_NOT_OBJECT } from '../../../../matchers/serviceError/array/toContainSE_NOT_OBJECT';

describe('toContainSE_NOT_OBJECT() test suite', () => {
  it('Should return object with pass field set to true if an array contains at least one ServiceError with reason NOT_OBJECT', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.NOT_OBJECT }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_NOT_OBJECT)(arrayWithError);

    expect(resp.pass).toBeTruthy();
  });

  it('Should return object with pass field set to false if an array does not contain at least one ServiceError with reason NOT_OBJECT', () => {
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    const resp = passJestThis(toContainSE_NOT_OBJECT)(arrayWithoutError);

    expect(resp.pass).toBeFalsy();
  });

  it('Should return object with pass field set to false if param is not an array', () => {
    const resp = passJestThis(toContainSE_NOT_OBJECT)('not array');

    expect(resp.pass).toBeFalsy();
  });

  it('Should be properly registered as a custom jest matcher', () => {
    const arrayWithError = [
      new ServiceError({ reason: SEReason.NOT_OBJECT }),
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];
    const arrayWithoutError = [
      new ServiceError({ reason: SEReason.NOT_ALLOWED }),
      { type: 'not error' },
    ];

    expect(arrayWithError).toContainSE_NOT_OBJECT();
    expect(arrayWithoutError).not.toContainSE_NOT_OBJECT();
  });
});
