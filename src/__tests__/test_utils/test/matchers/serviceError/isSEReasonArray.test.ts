import { SEReason } from '../../../../../common/service/basicService/SEReason';
import isSEReasonArray from '../../../matchers/serviceError/isSEErrorArray';

describe('isSEReasonArray() test suite', () => {
  it('Should return true if the provided value is an array of SEReasons', () => {
    const isReasonsArr = isSEReasonArray([
      SEReason.NOT_ARRAY,
      SEReason.NOT_ALLOWED,
    ]);
    expect(isReasonsArr).toBeTruthy();
  });

  it('Should return false if the provided value is not an array of SEReasons', () => {
    const isReasonsArr = isSEReasonArray(['not reason', 0]);
    expect(isReasonsArr).toBeFalsy();
  });

  it('Should return false if the provided value is not an array', () => {
    const isReasonsArr = isSEReasonArray(23);
    expect(isReasonsArr).toBeFalsy();
  });
});
