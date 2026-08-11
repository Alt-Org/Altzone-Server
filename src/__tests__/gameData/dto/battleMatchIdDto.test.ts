import 'reflect-metadata';
import { validate } from 'class-validator';
import { BattleResultDto } from '../../../gameData/dto/battleResult.dto';
import { SubmitResultDto } from '../../../gameData/dto/submitResult.dto';
import { RequestType } from '../../../gameData/enum/requestType.enum';

describe('Battle matchId DTO validation test suite', () => {
  const matchId = '665af23e5e982f0013aa9999';
  const player1Id = '665af23e5e982f0013aa1111';
  const player2Id = '665af23e5e982f0013aa2222';

  function createBattleResultDto(overrides: Partial<BattleResultDto> = {}) {
    const dto = new BattleResultDto();
    dto.type = RequestType.RESULT;
    dto.matchId = matchId;
    dto.team1 = [player1Id];
    dto.team2 = [player2Id];
    dto.duration = 120;
    dto.result = 1;

    return Object.assign(dto, overrides);
  }

  function createSubmitResultDto(overrides: Partial<SubmitResultDto> = {}) {
    const dto = new SubmitResultDto();
    dto.matchId = matchId;
    dto.duration = 120;
    dto.result = 1;

    return Object.assign(dto, overrides);
  }

  it('Should pass BattleResultDto validation with a MongoId matchId', async () => {
    const dto = createBattleResultDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail BattleResultDto validation with a non-MongoId matchId', async () => {
    const dto = createBattleResultDto({ matchId: 'test-steal-001' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('matchId');
    expect(errors[0].constraints?.isMongoId).toBe(
      'matchId must be a mongodb id',
    );
  });

  it('Should pass SubmitResultDto validation with a MongoId matchId', async () => {
    const dto = createSubmitResultDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail SubmitResultDto validation with a non-MongoId matchId', async () => {
    const dto = createSubmitResultDto({ matchId: 'test-steal-001' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('matchId');
    expect(errors[0].constraints?.isMongoId).toBe(
      'matchId must be a mongodb id',
    );
  });
});
