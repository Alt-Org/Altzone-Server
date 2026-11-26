import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.notFoundAsNull() test suite', () => {
  let rewarder: PackageRaceBattleRewarder;

  const notFound = new ServiceError({ reason: SEReason.NOT_FOUND });
  const unexpected = new ServiceError({ reason: SEReason.UNEXPECTED });

  beforeEach(() => {
    rewarder = createRewarderWithMocks().rewarder;
  });

  it('Should return null without errors if the only error is NOT_FOUND', () => {
    expect(rewarder['notFoundAsNull']([notFound])).toEqual([null, null]);
  });

  it('Should return null without errors if all errors are NOT_FOUND', () => {
    expect(rewarder['notFoundAsNull']([notFound, notFound])).toEqual([
      null,
      null,
    ]);
  });

  it('Should return the errors if an error is not NOT_FOUND', () => {
    expect(rewarder['notFoundAsNull']([unexpected])).toEqual([
      null,
      [unexpected],
    ]);
  });

  it('Should return all errors if NOT_FOUND is mixed with other errors', () => {
    expect(rewarder['notFoundAsNull']([notFound, unexpected])).toEqual([
      null,
      [notFound, unexpected],
    ]);
  });
});
