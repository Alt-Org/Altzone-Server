import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GlobalPlayerLeaderboardDto } from '../../../leaderboard/dto/globalPlayerLeaderboard.dto';
import { GlobalPlayerLeaderboardQueryDto } from '../../../leaderboard/dto/globalPlayerLeaderboardQuery.dto';

describe('Global player leaderboard DTOs', () => {
  it('uses the documented pagination defaults', async () => {
    const query = plainToInstance(GlobalPlayerLeaderboardQueryDto, {});

    await expect(validate(query)).resolves.toHaveLength(0);
    expect(query).toMatchObject({ page: 1, limit: 20 });
  });

  it.each([
    [{ page: '0' }, 'page'],
    [{ page: '1.5' }, 'page'],
    [{ page: ['1', '2'] }, 'page'],
    [{ limit: '0' }, 'limit'],
    [{ limit: '51' }, 'limit'],
    [{ limit: 'not-a-number' }, 'limit'],
  ])('rejects invalid pagination %o', async (input, invalidProperty) => {
    const query = plainToInstance(GlobalPlayerLeaderboardQueryDto, input);
    const errors = await validate(query);

    expect(errors.map((error) => error.property)).toContain(invalidProperty);
  });

  it('serializes only the public leaderboard fields', () => {
    const result = plainToInstance(
      GlobalPlayerLeaderboardDto,
      {
        entries: [
          {
            rank: 1,
            wins: 2,
            playerId: '665af23e5e9820013aa99991',
            nickname: 'player-one',
            avatar: null,
            clan: null,
            scoreReachedAt: '2026-01-01T00:00:00.000Z',
            battlePoints: 999,
          },
        ],
        ownRank: 1,
        itemCount: 1,
        acceptedWins: ['internal'],
      },
      { excludeExtraneousValues: true },
    );

    expect(result).toEqual({
      entries: [
        {
          rank: 1,
          wins: 2,
          playerId: '665af23e5e9820013aa99991',
          nickname: 'player-one',
          avatar: null,
          clan: null,
        },
      ],
      ownRank: 1,
      itemCount: 1,
    });
  });
});
