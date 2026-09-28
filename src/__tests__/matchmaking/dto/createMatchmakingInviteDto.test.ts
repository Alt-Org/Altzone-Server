import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateMatchmakingInviteDto } from '../../../matchmaking/dto/createMatchmakingInvite.dto';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';

describe('CreateMatchmakingInviteDto', () => {
  const createDto = (gameType: unknown) =>
    Object.assign(new CreateMatchmakingInviteDto(), {
      matchType: MatchType.RANDOM,
      gameType,
    });

  it('accepts an integer gameType', async () => {
    await expect(validate(createDto(1))).resolves.toHaveLength(0);
  });

  it.each([
    ['missing', undefined],
    ['string', '1'],
    ['decimal', 1.5],
    ['null', null],
  ])('rejects a %s gameType', async (_case, gameType) => {
    const errors = await validate(createDto(gameType));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('gameType');
    expect(errors[0].constraints?.isInt).toBe(
      'gameType must be an integer number',
    );
  });
});
