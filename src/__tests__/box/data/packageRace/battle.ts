import { Connection } from 'mongoose';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { PackageRaceBattleResult } from '../../../../box/packageRace/battle/packageRaceBattleResult.schema';
import { ActiveMatch } from '../../../../matchmaking/type/activeMatch.type';
import { MatchStatus } from '../../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { Player } from '../../../../player/schemas/player.schema';
import { Clan } from '../../../../clan/clan.schema';
import { Box } from '../../../../box/schemas/box.schema';
import { createStartedBox, uniqueName } from './startedBox';
import { createBoxPlayer } from './sessionTask';

/**
 * Finishes creating the collections and indexes the rewarder uses.
 * Otherwise a transaction can fail to acquire a collection lock while an index is still being built.
 *
 * @param connection mongoose connection of the test module
 */
export const initBattleCollections = async (connection: Connection) => {
  await Promise.all(
    [Player.name, Clan.name, Box.name].map((name) =>
      connection.model(name).init(),
    ),
  );
  await getBattleResultModel(connection).init();
  await getBattleResultModel(connection).syncIndexes();
};

/**
 * Creates a started box (blue team has 100, red team 5 battle points)
 * with one player in each team.
 */
export const createBattleBox = async () => {
  const { box_id, clanIds } = await createStartedBox();
  const bluePlayer = await createBoxPlayer(box_id, clanIds[0]);
  const redPlayer = await createBoxPlayer(box_id, clanIds[1]);
  return {
    box_id,
    blueTeam: clanIds[0],
    redTeam: clanIds[1],
    bluePlayer,
    redPlayer,
  };
};

/**
 * Creates a PackageRaceBattleRewarder with mocked services,
 * for testing how service errors are handled.
 */
export const createRewarderWithMocks = () => {
  const playerService = { basicService: { readMany: jest.fn() } };
  const clanService = {
    basicService: {
      readMany: jest.fn(),
      readOneById: jest.fn(),
      updateOneById: jest.fn(),
    },
  };
  const boxService = { readOneById: jest.fn() };
  const resultModel = { updateOne: jest.fn() };
  const rewarder = new PackageRaceBattleRewarder(
    playerService as any,
    clanService as any,
    boxService as any,
    resultModel as any,
  );
  return { rewarder, playerService, clanService, boxService, resultModel };
};

/**
 * Returns the model of the package race battle results.
 *
 * @param connection mongoose connection of the test module
 */
export const getBattleResultModel = (connection: Connection) =>
  connection.model<PackageRaceBattleResult>(PackageRaceBattleResult.name);

/**
 * Creates a finished 1v1 human match in which the player of side A wins.
 *
 * @param winnerId _id of the player on side A
 * @param loserId _id of the player on side B
 * @param overrides match fields to override
 */
export const createFinishedMatch = (
  winnerId: string,
  loserId: string,
  overrides: Partial<ActiveMatch> = {},
): ActiveMatch => ({
  id: uniqueName('match'),
  matchType: MatchType.RANDOM,
  gameType: 1,
  status: MatchStatus.FINISHED,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      participants: [{ playerId: winnerId, isBot: false }],
    },
    {
      side: TeamSide.B,
      participants: [{ playerId: loserId, isBot: false }],
    },
  ],
  startedAt: '2026-11-02T10:00:00.000Z',
  finishedAt: '2026-11-02T10:05:00.000Z',
  result: { winningSide: TeamSide.A },
  ...overrides,
});

/**
 * Runs rewardTeams() in a committed transaction, the way the match finish flow does.
 */
export const finishBattle = async (
  rewarder: PackageRaceBattleRewarder,
  connection: Connection,
  match: ActiveMatch,
) => {
  const session = await connection.startSession();
  try {
    session.startTransaction();
    const result = await rewarder.rewardTeams(match, session);
    if (result[1]) throw result[1];
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
