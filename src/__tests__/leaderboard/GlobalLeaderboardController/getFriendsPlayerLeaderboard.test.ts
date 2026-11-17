import { User } from '../../../auth/user';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GlobalLeaderboardController.getFriendsPlayerLeaderboard', () => {
  const getFriendsPlayerLeaderboard = jest.fn();
  const controller = new GlobalLeaderboardController({
    getFriendsPlayerLeaderboard,
  } as unknown as LeaderboardService);

  beforeEach(() => {
    getFriendsPlayerLeaderboard.mockReset();
    getFriendsPlayerLeaderboard.mockResolvedValue({
      entries: [],
      ownRank: 1,
      itemCount: 1,
    });
  });

  it('converts page pagination to an offset and forwards the player id', async () => {
    const response = await controller.getFriendsPlayerLeaderboard(
      { page: 3, limit: 20 },
      new User('profile-id', 'player-id'),
    );

    expect(getFriendsPlayerLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 20, skip: 40 },
      'player-id',
    );
    expect(response).toEqual({
      data: { leaderboard: { entries: [], ownRank: 1 } },
      metaData: {
        dataKey: 'leaderboard',
        modelName: 'Leaderboard',
        dataType: 'Object',
        dataCount: 1,
      },
      paginationData: {
        currentPage: 3,
        limit: 20,
        offset: 40,
        itemCount: 1,
        pageCount: 1,
      },
    });
  });
});
