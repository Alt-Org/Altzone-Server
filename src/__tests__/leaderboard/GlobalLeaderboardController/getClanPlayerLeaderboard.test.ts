import { User } from '../../../auth/user';
import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GlobalLeaderboardController.getClanPlayerLeaderboard', () => {
  const getClanPlayerLeaderboard = jest.fn();
  const controller = new GlobalLeaderboardController({
    getClanPlayerLeaderboard,
  } as unknown as LeaderboardService);

  beforeEach(() => {
    getClanPlayerLeaderboard.mockResolvedValue({
      entries: [],
      ownRank: 4,
      itemCount: 41,
    });
  });

  it('converts page pagination to an offset and forwards the player id', async () => {
    const response = await controller.getClanPlayerLeaderboard(
      { page: 3, limit: 20 },
      new User('profile-id', 'player-id'),
    );

    expect(getClanPlayerLeaderboard).toHaveBeenCalledWith(
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

  it('throws the documented not-found error when the player has no clan', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce(null);

    await expect(
      controller.getClanPlayerLeaderboard(
        { page: 1, limit: 20 },
        new User('profile-id', 'player-id'),
      ),
    ).rejects.toMatchObject<Partial<APIError>>({
      statusCode: 404,
      reason: APIErrorReason.NOT_FOUND,
      field: 'clan_id',
    });
  });
});
