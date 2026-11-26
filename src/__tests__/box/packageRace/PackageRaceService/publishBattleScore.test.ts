import { Logger } from '@nestjs/common';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { PackageRaceDto } from '../../../../box/packageRace/dto/packageRace.dto';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { PackageRaceBattleReward } from '../../../../box/packageRace/battle/packageRaceBattle.type';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';

describe('PackageRaceService.publishBattleScore() test suite', () => {
  let service: PackageRaceService;
  let notifier: { battleScoreUpdated: jest.Mock };
  let getPackageRace: jest.SpyInstance;

  const reward: PackageRaceBattleReward = {
    boxId: 'box-1',
    matchId: 'match-1',
    matchType: MatchType.RANDOM,
    awarded: true,
    teams: [
      {
        teamId: 'team-1',
        playerId: 'player-1',
        side: TeamSide.A,
        outcome: 'WIN',
        points: 30,
      },
      {
        teamId: 'team-2',
        playerId: 'player-2',
        side: TeamSide.B,
        outcome: 'LOSS',
        points: -20,
      },
    ],
  };

  const race = {
    boxId: 'box-1',
    status: PackageRaceStatus.ACTIVE,
    teams: [{ teamId: 'team-1' }, { teamId: 'team-2' }],
  } as unknown as PackageRaceDto;

  beforeEach(() => {
    notifier = { battleScoreUpdated: jest.fn() };
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

  it('Should read the package race of the box of the battle', async () => {
    await service.publishBattleScore(reward);

    expect(getPackageRace).toHaveBeenCalledWith('box-1');
  });

  it('Should notify the updated package race with the changes of both teams', async () => {
    await service.publishBattleScore(reward);

    expect(notifier.battleScoreUpdated).toHaveBeenCalledTimes(1);
    expect(notifier.battleScoreUpdated).toHaveBeenCalledWith(race, {
      matchId: 'match-1',
      teams: [
        { teamId: 'team-1', playerId: 'player-1', outcome: 'WIN', points: 30 },
        {
          teamId: 'team-2',
          playerId: 'player-2',
          outcome: 'LOSS',
          points: -20,
        },
      ],
    });
  });

  it('Should not notify and log a warning if the package race could not be read', async () => {
    getPackageRace.mockResolvedValue([
      null,
      [new ServiceError({ reason: SEReason.NOT_FOUND, field: 'box_id' })],
    ]);

    await service.publishBattleScore(reward);

    expect(notifier.battleScoreUpdated).not.toHaveBeenCalled();
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('box-1'),
    );
  });

  it('Should not throw and log an error if the notifier fails', async () => {
    const error = new Error('MQTT is down');
    notifier.battleScoreUpdated.mockImplementation(() => {
      throw error;
    });

    await expect(service.publishBattleScore(reward)).resolves.toBeUndefined();

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('box-1'),
      error,
    );
  });
});
