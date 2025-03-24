import { SEReason } from '../../../../../common/service/basicService/SEReason';
import isSEReason from '../../../matchers/serviceError/isSEReason';

describe('isSEReason() test suite', () => {
  it('Should return true if the provided value is SEReason', () => {
    const isReason = isSEReason(SEReason.LESS_THAN_MIN);
    expect(isReason).toBeTruthy();
  });

  it('Should return false if the provided value is not SEReason', () => {
    const isReason = isSEReason(345);
    expect(isReason).toBeFalsy();
  });

  it('Should return false if the provided value is null', () => {
    const isReason = isSEReason(null);
    expect(isReason).toBeFalsy();
  });
});
