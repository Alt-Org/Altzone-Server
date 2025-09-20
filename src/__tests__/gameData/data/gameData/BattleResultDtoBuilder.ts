import { BattleResultDto } from '../../../../gameData/dto/battleResult.dto';
import { RequestType } from '../../../../gameData/enum/requestType.enum';

export class BattleResultDtoBuilder {
  private readonly base: BattleResultDto = {
    type: RequestType.RESULT,
    team1: [],
    team2: [],
    duration: 0,
    winnerTeam: 0
  };

  build(): BattleResultDto {
    return { ...this.base } as BattleResultDto;
  }

  setType(type: RequestType): this {
    this.base.type = type;
    return this;
  }
  
  setTeam1(team1: string[]): this {
    this.base.team1 = team1;
    return this;
  }

  setTeam2(team2: string[]): this {
    this.base.team2 = team2;
    return this;
  }

  setDuration(duration: number): this {
    this.base.duration = duration;
    return this;
  }

  setWinnerTeam(winnerTeam: number): this {
    this.base.winnerTeam = winnerTeam;
    return this;
  }
  
}
