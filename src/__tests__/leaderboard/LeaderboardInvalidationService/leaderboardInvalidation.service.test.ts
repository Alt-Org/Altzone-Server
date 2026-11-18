import { LeaderboardInvalidationService } from '../../../leaderboard/leaderboardInvalidation.service';

describe('LeaderboardInvalidationService', () => {
  const invalidateScope = jest.fn();
  const getPlayerById = jest.fn();
  const getAcceptedFriendPlayerIds = jest.fn();

  const service = new LeaderboardInvalidationService(
    { invalidateScope } as never,
    { getPlayerById } as never,
    { getAcceptedFriendPlayerIds } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    invalidateScope.mockResolvedValue(undefined);
    getPlayerById.mockResolvedValue([
      { clan_id: { toString: () => 'clan-1' } },
      null,
    ]);
    getAcceptedFriendPlayerIds.mockResolvedValue(['friend-1', 'friend-2']);
  });

  it('invalidates global, current clan and every relevant friends view', async () => {
    await service.invalidatePlayerWin('winner-1');

    expect(new Set(invalidateScope.mock.calls.flat())).toEqual(
      new Set([
        'players:global',
        'players:clan:clan-1',
        'players:friends:winner-1',
        'players:friends:friend-1',
        'players:friends:friend-2',
      ]),
    );
  });

  it('still invalidates known scopes when related data cannot be loaded', async () => {
    getPlayerById.mockRejectedValueOnce(new Error('player lookup failed'));
    getAcceptedFriendPlayerIds.mockRejectedValueOnce(
      new Error('friend lookup failed'),
    );

    await expect(
      service.invalidatePlayerWin('winner-1'),
    ).resolves.toBeUndefined();
    expect(invalidateScope).toHaveBeenCalledTimes(2);
    expect(invalidateScope).toHaveBeenCalledWith('players:global');
    expect(invalidateScope).toHaveBeenCalledWith('players:friends:winner-1');
  });

  it('invalidates the global clan view after a clan win', async () => {
    await service.invalidateClanWin();
    expect(invalidateScope).toHaveBeenCalledWith('clans:global');
  });
});
