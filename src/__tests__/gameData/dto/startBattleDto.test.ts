import 'reflect-metadata';
import { validate } from 'class-validator';
import { StartBattleDto } from '../../../gameData/dto/startBattle.dto';
import { GameType } from '../../../gameData/enum/gameType.enum';

describe('StartBattleDto test suite', () => {
  const player1Id = '665af23e5e982f0013aa1111';
  const player2Id = '665af23e5e982f0013aa2222';
  const matchId = '665af23e5e982f0013aa9999';

  function createDto(overrides: Partial<StartBattleDto> = {}) {
    const dto = new StartBattleDto();
    dto.gameType = GameType.MATCHMAKING;
    dto.team1 = [player1Id];
    dto.team2 = [player2Id];

    return Object.assign(dto, overrides);
  }

  it('Should pass validation without matchId', async () => {
    const dto = createDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should pass validation with a MongoId matchId', async () => {
    const dto = createDto({ matchId });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail validation with a non-MongoId matchId', async () => {
    const dto = createDto({ matchId: 'test-steal-001' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('matchId');
    expect(errors[0].constraints?.isMongoId).toBe(
      'matchId must be a mongodb id',
    );
  });
});
