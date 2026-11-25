import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FinishMatchDto } from '../../../matchmaking/dto/finishMatch.dto';
import { MatchFinishReason } from '../../../matchmaking/enum/matchFinishReason.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';

describe('FinishMatchDto', () => {
  it('accepts a detailed result for both team sides', async () => {
    const dto = plainToInstance(FinishMatchDto, {
      winningSide: TeamSide.A,
      finishReason: MatchFinishReason.COMPLETED,
      teamScores: [
        { side: TeamSide.A, score: 4 },
        { side: TeamSide.B, score: 2 },
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('keeps the legacy winning-side-only body valid', async () => {
    const dto = plainToInstance(FinishMatchDto, {
      winningSide: TeamSide.B,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    {
      winningSide: TeamSide.A,
      finishReason: 'UNKNOWN',
    },
    {
      winningSide: TeamSide.A,
      teamScores: [{ side: TeamSide.A, score: 1 }],
    },
    {
      winningSide: TeamSide.A,
      teamScores: [
        { side: TeamSide.A, score: 1 },
        { side: TeamSide.A, score: 0 },
      ],
    },
    {
      winningSide: TeamSide.A,
      teamScores: [
        { side: TeamSide.A, score: -1 },
        { side: TeamSide.B, score: 0 },
      ],
    },
  ])('rejects an invalid detailed result: %o', async (body) => {
    const dto = plainToInstance(FinishMatchDto, body);

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
