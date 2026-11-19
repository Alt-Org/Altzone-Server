import { FriendshipService } from '../../../friendship/friendship.service';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('LeaderboardService.getFriendsLeaderboardPlayerIds', () => {
  const getAcceptedFriendPlayerIds = jest.fn();
  const service = new LeaderboardService(undefined, undefined, undefined, {
    getAcceptedFriendPlayerIds,
  } as unknown as FriendshipService);

  beforeEach(() => {
    getAcceptedFriendPlayerIds.mockReset();
  });

  it('includes the requester and removes duplicate player ids', async () => {
    getAcceptedFriendPlayerIds.mockResolvedValue([
      'friend-a',
      'friend-b',
      'friend-a',
      'requester',
    ]);

    await expect(
      service.getFriendsLeaderboardPlayerIds('requester'),
    ).resolves.toEqual(['requester', 'friend-a', 'friend-b']);
    expect(getAcceptedFriendPlayerIds).toHaveBeenCalledWith('requester');
  });

  it('contains only the requester when there are no accepted friends', async () => {
    getAcceptedFriendPlayerIds.mockResolvedValue([]);

    await expect(
      service.getFriendsLeaderboardPlayerIds('requester'),
    ).resolves.toEqual(['requester']);
  });
});
