import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PackageRaceBattleModule from '../../modules/packageRaceBattle.module';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import {
  BOX_SESSION_BATTLE_LOSS_POINTS,
  BOX_SESSION_BATTLE_WIN_POINTS,
} from '../../../../box/consts/boxSessionConstants';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { uniqueName } from '../../data/packageRace/startedBox';
import { createBoxPlayer } from '../../data/packageRace/sessionTask';
import {
  createBattleBox,
  createFinishedMatch,
  finishBattle,
  getBattleResultModel,
  initBattleCollections,
} from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.rewardTeams() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: PackageRaceBattleRewarder;
  let connection: Connection;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

  const getBattlePoints = async (clanId: ObjectId) =>
    (await clanModel.findById(clanId).lean()).battlePoints;

  beforeAll(async () => {
    const module = await PackageRaceBattleModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
    await initBattleCollections(connection);
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    const module = await PackageRaceBattleModule.getModule();
    rewarder = module.get(PackageRaceBattleRewarder);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
      getBattleResultModel(connection).deleteMany(),
    ]);
  });

  it('Should use the normal matchmaking win and loss battle points', () => {
    expect(BOX_SESSION_BATTLE_WIN_POINTS).toBe(30);
    expect(BOX_SESSION_BATTLE_LOSS_POINTS).toBe(-20);
  });

  it('Should give the winning team +30 and the losing team -20 battle points', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer),
    );

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(true);
    expect(await getBattlePoints(redTeam)).toBe(5 + 30);
    expect(await getBattlePoints(blueTeam)).toBe(100 - 20);
  });

  it('Should return the change of both teams', async () => {
    const { box_id, blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    const match = createFinishedMatch(redPlayer, bluePlayer);

    const [reward] = await finishBattle(rewarder, connection, match);

    expect(reward).toEqual({
      boxId: box_id,
      matchId: match.id,
      matchType: MatchType.RANDOM,
      awarded: true,
      teams: [
        {
          teamId: redTeam.toString(),
          playerId: redPlayer,
          side: TeamSide.A,
          outcome: 'WIN',
          points: 30,
        },
        {
          teamId: blueTeam.toString(),
          playerId: bluePlayer,
          side: TeamSide.B,
          outcome: 'LOSS',
          points: -20,
        },
      ],
    });
  });

  it('Should record the change of both teams in one battle result', async () => {
    const { box_id, blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    const match = createFinishedMatch(redPlayer, bluePlayer);

    await finishBattle(rewarder, connection, match);

    const results = await getBattleResultModel(connection).find().lean();
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(
      expect.objectContaining({
        box_id,
        matchId: match.id,
        matchType: MatchType.RANDOM,
        winningSide: TeamSide.A,
      }),
    );
    expect(
      results[0].teams.map((team) => ({
        ...team,
        team_id: team.team_id.toString(),
        player_id: team.player_id.toString(),
      })),
    ).toEqual([
      {
        team_id: redTeam.toString(),
        player_id: redPlayer,
        side: TeamSide.A,
        outcome: 'WIN',
        points: 30,
        appliedPoints: 30,
        battlePointsAfter: 35,
      },
      {
        team_id: blueTeam.toString(),
        player_id: bluePlayer,
        side: TeamSide.B,
        outcome: 'LOSS',
        points: -20,
        appliedPoints: -20,
        battlePointsAfter: 80,
      },
    ]);
  });

  it('Should not let team battle points go below 0', async () => {
    const { redTeam, bluePlayer, redPlayer } = await createBattleBox();

    const [reward] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(bluePlayer, redPlayer),
    );

    expect(await getBattlePoints(redTeam)).toBe(0);
    expect(reward.teams[1]).toEqual(
      expect.objectContaining({ outcome: 'LOSS', points: -5 }),
    );
    const [result] = await getBattleResultModel(connection).find().lean();
    expect(result.teams[1]).toEqual(
      expect.objectContaining({
        points: -20,
        appliedPoints: -5,
        battlePointsAfter: 0,
      }),
    );
  });

  it('Should count a match result only once', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    const match = createFinishedMatch(redPlayer, bluePlayer);

    await finishBattle(rewarder, connection, match);
    const [reward, errors] = await finishBattle(rewarder, connection, match);

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(false);
    expect(reward.skipReason).toBe('ALREADY_PROCESSED');
    expect(reward.teams.map((team) => team.points)).toEqual([0, 0]);
    expect(await getBattlePoints(redTeam)).toBe(35);
    expect(await getBattlePoints(blueTeam)).toBe(80);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(1);
  });

  it('Should count each different match of the same players', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer),
    );
    await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(bluePlayer, redPlayer),
    );

    expect(await getBattlePoints(redTeam)).toBe(5 + 30 - 20);
    expect(await getBattlePoints(blueTeam)).toBe(100 - 20 + 30);
  });

  it('Should count CLAN matchmaking battles with the same points', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    const [reward] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer, { matchType: MatchType.CLAN }),
    );

    expect(reward.awarded).toBe(true);
    expect(await getBattlePoints(redTeam)).toBe(35);
    expect(await getBattlePoints(blueTeam)).toBe(80);
  });

  it('Should not change the player battle points or statistics', async () => {
    const { bluePlayer, redPlayer } = await createBattleBox();
    const before = await playerModel
      .find({}, { battlePoints: 1, gameStatistics: 1 })
      .sort({ _id: 1 })
      .lean();

    await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer),
    );

    const after = await playerModel
      .find({}, { battlePoints: 1, gameStatistics: 1 })
      .sort({ _id: 1 })
      .lean();
    expect(after).toEqual(before);
  });

  it('Should return null for a CUSTOM match', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer, {
        matchType: MatchType.CUSTOM,
      }),
    );

    expect(errors).toBeNull();
    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattlePoints(blueTeam)).toBe(100);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });

  it('Should return null for a match against a bot', async () => {
    const { redTeam, redPlayer } = await createBattleBox();
    const match = createFinishedMatch(redPlayer, 'unused');
    match.teams[1].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    const [reward, errors] = await finishBattle(rewarder, connection, match);

    expect(errors).toBeNull();
    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });

  it('Should return null for a 2v2 match', async () => {
    const { box_id, blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    const match = createFinishedMatch(redPlayer, bluePlayer, { teamSize: 2 });
    match.teams[0].participants.push({
      playerId: await createBoxPlayer(box_id, redTeam),
      isBot: false,
    });
    match.teams[1].participants.push({
      playerId: await createBoxPlayer(box_id, blueTeam),
      isBot: false,
    });

    const [reward] = await finishBattle(rewarder, connection, match);

    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
  });

  it('Should return null if the opponent belongs to another box', async () => {
    const { redTeam, redPlayer } = await createBattleBox();
    const otherBox = await createBattleBox();

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, otherBox.bluePlayer),
    );

    expect(errors).toBeNull();
    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattlePoints(otherBox.blueTeam)).toBe(100);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });

  it('Should return null if the opponent is not a box session player', async () => {
    const { redTeam, redPlayer } = await createBattleBox();
    const regularPlayer = await playerModel.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setName(uniqueName('regular-player'))
        .setUniqueIdentifier(uniqueName('regular-device'))
        .build(),
    );

    const [reward] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, regularPlayer._id.toString()),
    );

    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
  });

  it('Should not count a battle between players of the same team', async () => {
    const { box_id, redTeam, redPlayer } = await createBattleBox();
    const teammate = await createBoxPlayer(box_id, redTeam);

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, teammate),
    );

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(false);
    expect(reward.skipReason).toBe('SAME_TEAM');
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });

  it('Should not count the battle if the package race has ended', async () => {
    const { box_id, blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    await boxModel.updateOne(
      { _id: box_id },
      { $set: { 'packageRace.status': PackageRaceStatus.ENDED } },
    );

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer),
    );

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(false);
    expect(reward.skipReason).toBe('RACE_NOT_ACTIVE');
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattlePoints(blueTeam)).toBe(100);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });

  it('Should not change anything if the transaction is aborted', async () => {
    const { blueTeam, redTeam, bluePlayer, redPlayer } =
      await createBattleBox();
    const match = createFinishedMatch(redPlayer, bluePlayer);

    const session = await connection.startSession();
    session.startTransaction();
    await rewarder.rewardTeams(match, session);
    await session.abortTransaction();
    await session.endSession();

    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattlePoints(blueTeam)).toBe(100);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);

    const [reward] = await finishBattle(rewarder, connection, match);
    expect(reward.awarded).toBe(true);
  });

  it('Should return null if the API is not running in TESTING_SESSION', async () => {
    const { redTeam, bluePlayer, redPlayer } = await createBattleBox();
    envVars.ENVIRONMENT = Environment.PRODUCTION;

    const [reward, errors] = await finishBattle(
      rewarder,
      connection,
      createFinishedMatch(redPlayer, bluePlayer),
    );

    expect(errors).toBeNull();
    expect(reward).toBeNull();
    expect(await getBattlePoints(redTeam)).toBe(5);
    expect(await getBattleResultModel(connection).countDocuments()).toBe(0);
  });
});
