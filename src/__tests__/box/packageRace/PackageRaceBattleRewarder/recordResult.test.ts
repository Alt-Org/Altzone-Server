import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import PackageRaceBattleModule from '../../modules/packageRaceBattle.module';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import {
  createFinishedMatch,
  createRewarderWithMocks,
  getBattleResultModel,
  initBattleCollections,
} from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.recordResult() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: PackageRaceBattleRewarder;
  let connection: Connection;

  const boxId = new ObjectId().toString();
  const winnerId = new ObjectId().toString();
  const loserId = new ObjectId().toString();
  const winnerTeamId = new ObjectId().toString();
  const loserTeamId = new ObjectId().toString();

  const battle = {
    boxId,
    teams: [
      {
        playerId: winnerId,
        side: TeamSide.A,
        outcome: 'WIN' as const,
        teamId: winnerTeamId,
      },
      {
        playerId: loserId,
        side: TeamSide.B,
        outcome: 'LOSS' as const,
        teamId: loserTeamId,
      },
    ],
  };

  const recordResult = (match = createFinishedMatch(winnerId, loserId)) =>
    rewarder['recordResult'](match, battle as any, null);

  beforeAll(async () => {
    const module = await PackageRaceBattleModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
    await initBattleCollections(connection);
  });

  beforeEach(async () => {
    const module = await PackageRaceBattleModule.getModule();
    rewarder = module.get(PackageRaceBattleRewarder);
  });

  afterEach(async () => {
    await getBattleResultModel(connection).deleteMany();
  });

  it('Should return true when the result of the match is recorded for the first time', async () => {
    expect(await recordResult()).toEqual([true, null]);
  });

  it('Should save the battle result to DB', async () => {
    const match = createFinishedMatch(winnerId, loserId, {
      matchType: MatchType.CLAN,
    });

    await recordResult(match);

    const saved = await getBattleResultModel(connection).findOne().lean();
    expect(saved).toEqual(
      expect.objectContaining({
        box_id: boxId,
        matchId: match.id,
        matchType: MatchType.CLAN,
        winningSide: TeamSide.A,
        finishedAt: new Date(match.finishedAt),
      }),
    );
  });

  it('Should save the outcome and the points of both teams without applied points', async () => {
    await recordResult();

    const saved = await getBattleResultModel(connection).findOne().lean();
    expect(
      saved.teams.map((team) => ({
        ...team,
        team_id: team.team_id.toString(),
        player_id: team.player_id.toString(),
      })),
    ).toEqual([
      {
        team_id: winnerTeamId,
        player_id: winnerId,
        side: TeamSide.A,
        outcome: 'WIN',
        points: 30,
        appliedPoints: null,
        battlePointsAfter: null,
      },
      {
        team_id: loserTeamId,
        player_id: loserId,
        side: TeamSide.B,
        outcome: 'LOSS',
        points: -20,
        appliedPoints: null,
        battlePointsAfter: null,
      },
    ]);
  });

  it('Should return false if the result of the match is already recorded', async () => {
    const match = createFinishedMatch(winnerId, loserId);

    await recordResult(match);

    expect(await recordResult(match)).toEqual([false, null]);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(1);
  });

  it('Should not overwrite the first record of the match', async () => {
    const match = createFinishedMatch(winnerId, loserId);
    await recordResult(match);

    await recordResult({
      ...match,
      matchType: MatchType.CLAN,
      result: { winningSide: TeamSide.B },
    });

    const saved = await getBattleResultModel(connection).findOne().lean();
    expect(saved.matchType).toBe(MatchType.RANDOM);
    expect(saved.winningSide).toBe(TeamSide.A);
  });

  it('Should return true for another match of the same players', async () => {
    await recordResult();

    expect(await recordResult()).toEqual([true, null]);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(2);
  });

  it('Should return ServiceErrors if saving the result fails', async () => {
    const mocks = createRewarderWithMocks();
    mocks.resultModel.updateOne.mockRejectedValue(new Error('DB is down'));

    const [isFirst, errors] = await mocks.rewarder['recordResult'](
      createFinishedMatch(winnerId, loserId),
      battle as any,
      null,
    );

    expect(isFirst).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({ reason: SEReason.UNEXPECTED }),
    ]);
  });

  it('Should upsert the result in the given session', async () => {
    const mocks = createRewarderWithMocks();
    const session = { id: 'session' } as any;
    const match = createFinishedMatch(winnerId, loserId);
    mocks.resultModel.updateOne.mockResolvedValue({ upsertedCount: 1 });

    await mocks.rewarder['recordResult'](match, battle as any, session);

    expect(mocks.resultModel.updateOne).toHaveBeenCalledWith(
      { matchId: match.id },
      expect.objectContaining({ $setOnInsert: expect.any(Object) }),
      { upsert: true, session },
    );
  });
});
