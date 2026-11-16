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
      ownRank: null,
      itemCount: 41,
    });
  });

  it('converts pagination to an offset and forwards the clan id', async () => {
    const response = await controller.getClanPlayerLeaderboard(
      { clanId: '665af23e5e9820013aa99991' },
      { page: 3, limit: 20 },
    );

    expect(getClanPlayerLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 20, skip: 40 },
      '665af23e5e9820013aa99991',
    );
    expect(response.paginationData).toEqual({
      currentPage: 3,
      limit: 20,
      offset: 40,
      itemCount: 41,
      pageCount: 3,
    });
    expect(response.data.leaderboard).toEqual({
      entries: [],
      ownRank: null,
    });
  });

  it('throws the documented not-found error for an unknown clan', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce(null);

    await expect(
      controller.getClanPlayerLeaderboard(
        { clanId: '665af23e5e9820013aa99991' },
        { page: 1, limit: 20 },
      ),
    ).rejects.toMatchObject<Partial<APIError>>({
      statusCode: 404,
      reason: APIErrorReason.NOT_FOUND,
      field: 'clanId',
      value: '665af23e5e9820013aa99991',
    });
  });
});
