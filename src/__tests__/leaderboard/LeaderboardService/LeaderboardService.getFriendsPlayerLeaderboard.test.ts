import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Environment } from '../../../common/enum/environment.enum';
import { ModelName } from '../../../common/enum/modelName.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import LeaderboardModule from '../modules/leaderboard.module';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';

describe('LeaderboardService.getFriendsPlayerLeaderboard', () => {
  let service: LeaderboardService;
  const originalServerEnvironment = envVars.ENVIRONMENT;
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const friendshipCollection = mongoose.connection.collection(
    ModelName.FRIENDSHIP,
  );
  const winCollection = mongoose.connection.collection(
    ModelName.PLAYER_LEADERBOARD_WIN,
  );

  const query = (limit = 20, skip = 0) => ({
    filter: {},
    sort: {},
    limit,
    skip,
  });

  const createPlayer = async (
    id: string,
    name: string,
    createdAt: Date,
    isProfilePrivate = false,
    clanId?: string | ObjectId,
  ) => {
    const player = PlayerBuilderFactory.getBuilder('Player')
      .setId(new ObjectId(id))
      .setName(name)
      .setUniqueIdentifier(`${name}-identifier`)
      .setEnvironment(Environment.OPEN_DEMO)
      .setIsProfilePrivate(isProfilePrivate)
      .setClanId(clanId)
      .build();

    return playerModel.create({ ...player, createdAt });
  };

  const createFriendship = async (
    playerA: string,
    playerB: string,
    status: FriendshipStatus,
  ) =>
    friendshipCollection.insertOne({
      playerA: new ObjectId(playerA),
      playerB: new ObjectId(playerB),
      status,
      pairKey: [playerA, playerB].sort().join('_'),
    });

  const recordWin = async (
    battleId: string,
    playerId: string,
    scoreReachedAt: Date,
  ) =>
    winCollection.insertOne({
      battleId,
      playerId: new ObjectId(playerId),
      scoreReachedAt,
    });

  beforeAll(async () => {
    service = await LeaderboardModule.getLeaderboardService();
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
    await Promise.all([
      playerModel.deleteMany({}),
      clanModel.deleteMany({}),
      friendshipCollection.deleteMany({}),
      winCollection.deleteMany({}),
    ]);
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalServerEnvironment;
  });

  it('ranks the requester and accepted friends before applying pagination', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    const laterFriendId = '665af23e5e9820013aa99992';
    const earlierPrivateFriendId = '665af23e5e9820013aa99993';
    const pendingPlayerId = '665af23e5e9820013aa99994';
    const unrelatedPlayerId = '665af23e5e9820013aa99995';

    await Promise.all([
      createPlayer(
        requesterId,
        'requester',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        laterFriendId,
        'later-friend',
        new Date('2026-01-02T00:00:00.000Z'),
      ),
      createPlayer(
        earlierPrivateFriendId,
        'private-friend',
        new Date('2026-01-03T00:00:00.000Z'),
        true,
      ),
      createPlayer(
        pendingPlayerId,
        'pending-player',
        new Date('2026-01-04T00:00:00.000Z'),
      ),
      createPlayer(
        unrelatedPlayerId,
        'unrelated-player',
        new Date('2026-01-05T00:00:00.000Z'),
      ),
    ]);
    await Promise.all([
      createFriendship(requesterId, laterFriendId, FriendshipStatus.ACCEPTED),
      createFriendship(
        earlierPrivateFriendId,
        requesterId,
        FriendshipStatus.ACCEPTED,
      ),
      createFriendship(requesterId, pendingPlayerId, FriendshipStatus.PENDING),
      recordWin('later-1', laterFriendId, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('later-2', laterFriendId, new Date('2026-02-03T00:00:00.000Z')),
      recordWin(
        'earlier-1',
        earlierPrivateFriendId,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
      recordWin(
        'earlier-2',
        earlierPrivateFriendId,
        new Date('2026-02-02T00:00:00.000Z'),
      ),
      recordWin(
        'unrelated-1',
        unrelatedPlayerId,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ]);

    const result = await service.getFriendsPlayerLeaderboard(
      query(1, 1),
      requesterId,
    );

    expect(result).toEqual({
      entries: [
        expect.objectContaining({
          rank: 2,
          wins: 2,
          playerId: laterFriendId,
          nickname: 'later-friend',
        }),
      ],
      ownRank: 3,
      itemCount: 3,
    });
  });

  it('returns the requester at rank one when there are no accepted friends', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    await createPlayer(
      requesterId,
      'requester',
      new Date('2026-01-01T00:00:00.000Z'),
      true,
    );

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );

    expect(result).toEqual({
      entries: [
        expect.objectContaining({
          rank: 1,
          wins: 0,
          playerId: requesterId,
        }),
      ],
      ownRank: 1,
      itemCount: 1,
    });
  });

  it('preserves ownRank on an out-of-range page', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    await createPlayer(
      requesterId,
      'requester',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    await expect(
      service.getFriendsPlayerLeaderboard(query(20, 100), requesterId),
    ).resolves.toEqual({ entries: [], ownRank: 1, itemCount: 1 });
  });

  it('removes a former friend from the next leaderboard request', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    const friendId = '665af23e5e9820013aa99992';
    await Promise.all([
      createPlayer(
        requesterId,
        'requester',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        friendId,
        'former-friend',
        new Date('2026-01-02T00:00:00.000Z'),
      ),
      createFriendship(requesterId, friendId, FriendshipStatus.ACCEPTED),
    ]);

    await expect(
      service.getFriendsPlayerLeaderboard(query(), requesterId),
    ).resolves.toMatchObject({ itemCount: 2 });

    await friendshipCollection.deleteOne({
      pairKey: [requesterId, friendId].sort().join('_'),
    });

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );
    expect(result.itemCount).toBe(1);
    expect(result.entries.map((entry) => entry.playerId)).toEqual([
      requesterId,
    ]);
  });

  it('excludes a friend as soon as the relationship is blocked', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    const friendId = '665af23e5e9820013aa99992';
    const pairKey = [requesterId, friendId].sort().join('_');
    await Promise.all([
      createPlayer(
        requesterId,
        'requester',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        friendId,
        'blocked-player',
        new Date('2026-01-02T00:00:00.000Z'),
      ),
      createFriendship(requesterId, friendId, FriendshipStatus.ACCEPTED),
    ]);

    await friendshipCollection.updateOne(
      { pairKey },
      { $set: { status: FriendshipStatus.BLOCKED } },
    );

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );
    expect(result.itemCount).toBe(1);
    expect(result.entries.map((entry) => entry.playerId)).toEqual([
      requesterId,
    ]);
  });

  it('ignores an accepted friendship whose friend account was deleted', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    const deletedFriendId = '665af23e5e9820013aa99992';
    await Promise.all([
      createPlayer(
        requesterId,
        'requester',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        deletedFriendId,
        'deleted-friend',
        new Date('2026-01-02T00:00:00.000Z'),
      ),
      createFriendship(requesterId, deletedFriendId, FriendshipStatus.ACCEPTED),
    ]);
    await playerModel.deleteOne({ _id: new ObjectId(deletedFriendId) });

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );
    expect(result.itemCount).toBe(1);
    expect(result.entries.map((entry) => entry.playerId)).toEqual([
      requesterId,
    ]);
  });

  it('uses the stable player id as the final tie-breaker', async () => {
    const requesterId = '665af23e5e9820013aa99993';
    const lowerFriendId = '665af23e5e9820013aa99991';
    const higherFriendId = '665af23e5e9820013aa99992';
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    await Promise.all([
      createPlayer(requesterId, 'requester', createdAt),
      createPlayer(lowerFriendId, 'lower-friend', createdAt),
      createPlayer(higherFriendId, 'higher-friend', createdAt),
      createFriendship(requesterId, lowerFriendId, FriendshipStatus.ACCEPTED),
      createFriendship(requesterId, higherFriendId, FriendshipStatus.ACCEPTED),
    ]);

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );

    expect(result.entries.map((entry) => entry.playerId)).toEqual([
      lowerFriendId,
      higherFriendId,
      requesterId,
    ]);
    expect(result.ownRank).toBe(3);
  });

  it('returns current clan presentation data for a friend', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    const friendId = '665af23e5e9820013aa99992';
    const clan = await clanModel.create(
      ClanBuilderFactory.getBuilder('Clan')
        .setName('current-clan')
        .setEnvironment(Environment.OPEN_DEMO)
        .build(),
    );
    await Promise.all([
      createPlayer(
        requesterId,
        'requester',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        friendId,
        'clan-friend',
        new Date('2026-01-02T00:00:00.000Z'),
        false,
        clan._id,
      ),
      createFriendship(requesterId, friendId, FriendshipStatus.ACCEPTED),
    ]);

    const result = await service.getFriendsPlayerLeaderboard(
      query(),
      requesterId,
    );
    const friendEntry = result.entries.find(
      (entry) => entry.playerId === friendId,
    );

    expect(friendEntry?.clan).toEqual({
      clanId: clan._id.toString(),
      name: 'current-clan',
      logo: clan.clanLogo,
    });
  });

  it('does not expose production players in testing-session mode', async () => {
    const requesterId = '665af23e5e9820013aa99991';
    await createPlayer(
      requesterId,
      'requester',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(
      service.getFriendsPlayerLeaderboard(query(), requesterId),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });
});
