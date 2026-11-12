import { User } from '../../../auth/user';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GlobalLeaderboardController.getGlobalPlayerLeaderboard', () => {
  const getGlobalPlayerLeaderboard = jest.fn();
  const controller = new GlobalLeaderboardController({
    getGlobalPlayerLeaderboard,
  } as unknown as LeaderboardService);

  beforeEach(() => {
    getGlobalPlayerLeaderboard.mockResolvedValue({
      entries: [],
      ownRank: null,
      itemCount: 0,
    });
  });

  it('converts page pagination to an offset and forwards the player id', async () => {
    const user = new User('profile-id', 'player-id');

    await controller.getGlobalPlayerLeaderboard(
      { page: 3, limit: 20 },
      user,
    );

    expect(getGlobalPlayerLeaderboard).toHaveBeenCalledWith(
      {
        filter: {},
        sort: {},
        limit: 20,
        skip: 40,
      },
      'player-id',
    );
  });

  it('forwards an anonymous request without a player id', async () => {
    await controller.getGlobalPlayerLeaderboard({ page: 1, limit: 20 });

    expect(getGlobalPlayerLeaderboard).toHaveBeenCalledWith(
      {
        filter: {},
        sort: {},
        limit: 20,
        skip: 0,
      },
      undefined,
    );
  });
});
