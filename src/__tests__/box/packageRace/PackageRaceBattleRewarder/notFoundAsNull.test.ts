import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { PackageRaceBattleRewarderHelperService } from '../../../../box/packageRace/battle/packageRaceBattleRewarderHelper.service';

describe('PackageRaceBattleRewarder.notFoundAsNull() test suite', () => {
  let helperService: PackageRaceBattleRewarderHelperService;

  const notFound = new ServiceError({ reason: SEReason.NOT_FOUND });
  const unexpected = new ServiceError({ reason: SEReason.UNEXPECTED });

  beforeEach(() => {
    helperService = new PackageRaceBattleRewarderHelperService();
  });

  it('Should return null without errors if the only error is NOT_FOUND', () => {
    expect(helperService.notFoundAsNull([notFound])).toEqual([null, null]);
  });

  it('Should return null without errors if all errors are NOT_FOUND', () => {
    expect(helperService.notFoundAsNull([notFound, notFound])).toEqual([
      null,
      null,
    ]);
  });

  it('Should return the errors if an error is not NOT_FOUND', () => {
    expect(helperService.notFoundAsNull([unexpected])).toEqual([
      null,
      [unexpected],
    ]);
  });

  it('Should return all errors if NOT_FOUND is mixed with other errors', () => {
    expect(helperService.notFoundAsNull([notFound, unexpected])).toEqual([
      null,
      [notFound, unexpected],
    ]);
  });
});
