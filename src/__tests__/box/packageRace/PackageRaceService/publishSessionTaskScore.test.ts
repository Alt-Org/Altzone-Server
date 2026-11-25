import { Logger } from '@nestjs/common';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { PackageRaceDto } from '../../../../box/packageRace/dto/packageRace.dto';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { SessionTaskReward } from '../../../../box/packageRace/sessionTask/sessionTaskReward.type';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';

describe('PackageRaceService.publishSessionTaskScore() test suite', () => {
  let service: PackageRaceService;
  let notifier: { scoreUpdated: jest.Mock };
  let getPackageRace: jest.SpyInstance;

  const reward: SessionTaskReward = {
    boxId: 'box-1',
    teamId: 'team-1',
    completedByPlayerId: 'player-1',
    taskType: 'spot_the_glitch',
    points: 20,
    awarded: true,
    reachedMilestones: [],
  };

  const race = {
    boxId: 'box-1',
    status: PackageRaceStatus.ACTIVE,
    teams: [{ teamId: 'team-1' }, { teamId: 'team-2' }],
  } as unknown as PackageRaceDto;

  beforeEach(() => {
    notifier = { scoreUpdated: jest.fn() };
    service = new PackageRaceService(
      {} as any,
      {} as any,
      {} as any,
      notifier as any,
    );
    getPackageRace = jest
      .spyOn(service, 'getPackageRace')
      .mockResolvedValue([race, null]);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should read the package race of the rewarded box', async () => {
    await service.publishSessionTaskScore(reward);

    expect(getPackageRace).toHaveBeenCalledTimes(1);
    expect(getPackageRace).toHaveBeenCalledWith('box-1');
  });

  it('Should notify the updated package race with the scored session task', async () => {
    await service.publishSessionTaskScore(reward);

    expect(notifier.scoreUpdated).toHaveBeenCalledTimes(1);
    expect(notifier.scoreUpdated).toHaveBeenCalledWith(race, {
      type: 'spot_the_glitch',
      teamId: 'team-1',
      completedByPlayerId: 'player-1',
      points: 20,
    });
  });

  it('Should not pass reward-only fields to the notifier', async () => {
    await service.publishSessionTaskScore({
      ...reward,
      reachedMilestones: [5460],
    });

    const [, sessionTask] = notifier.scoreUpdated.mock.calls[0];
    expect(sessionTask).not.toHaveProperty('awarded');
    expect(sessionTask).not.toHaveProperty('reachedMilestones');
    expect(sessionTask).not.toHaveProperty('boxId');
  });

  it('Should not notify and log a warning if the package race could not be read', async () => {
    getPackageRace.mockResolvedValue([
      null,
      [new ServiceError({ reason: SEReason.NOT_FOUND, field: 'box_id' })],
    ]);

    await service.publishSessionTaskScore(reward);

    expect(notifier.scoreUpdated).not.toHaveBeenCalled();
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('box-1'),
    );
  });

  it('Should not throw and log an error if reading the package race fails', async () => {
    const error = new Error('DB is down');
    getPackageRace.mockRejectedValue(error);

    await expect(
      service.publishSessionTaskScore(reward),
    ).resolves.toBeUndefined();

    expect(notifier.scoreUpdated).not.toHaveBeenCalled();
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('box-1'),
      error,
    );
  });

  it('Should not throw and log an error if the notifier fails', async () => {
    const error = new Error('MQTT is down');
    notifier.scoreUpdated.mockImplementation(() => {
      throw error;
    });

    await expect(
      service.publishSessionTaskScore(reward),
    ).resolves.toBeUndefined();

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('box-1'),
      error,
    );
  });
});
