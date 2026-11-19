import { User } from '../../../auth/user';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GlobalLeaderboardController.getGlobalClanLeaderboard', () => {
  const getGlobalClanLeaderboard = jest.fn();
  const controller = new GlobalLeaderboardController({
    getGlobalClanLeaderboard,
  } as unknown as LeaderboardService);

  beforeEach(() => {
    getGlobalClanLeaderboard.mockResolvedValue({
      entries: [],
      ownRank: 4,
      itemCount: 41,
    });
  });

  it('converts page pagination to an offset and forwards the player id', async () => {
    const response = await controller.getGlobalClanLeaderboard(
      { page: 3, limit: 20 },
      new User('profile-id', 'player-id'),
    );

    expect(getGlobalClanLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 20, skip: 40 },
      'player-id',
    );
    expect(response.paginationData).toEqual({
      currentPage: 3,
      limit: 20,
      offset: 40,
      itemCount: 41,
      pageCount: 3,
    });
    expect(response.data.leaderboard).toEqual({ entries: [], ownRank: 4 });
  });

  it('forwards an anonymous request without a player id', async () => {
    await controller.getGlobalClanLeaderboard({ page: 1, limit: 20 });

    expect(getGlobalClanLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 20, skip: 0 },
      undefined,
    );
  });
});
