import { BattleResultDto } from '../../../../gameData/dto/battleResult.dto';
import { RequestType } from '../../../../gameData/enum/requestType.enum';

export class BattleResultDtoBuilder {
  private readonly base: any = {
    matchId: 'default-match',
    type: RequestType.RESULT,
    team1: [],
    team2: [],
    duration: 0,
    result: 0,
    winnerTeam: 0,
  };

  setMatchId(id: string): this {
    this.base.matchId = id;
    return this;
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

  setDuration(d: number): this {
    this.base.duration = d;
    return this;
  }

  setWinnerTeam(team: number): this {
    this.base.result = team;
    this.base.winnerTeam = team;
    return this;
  }

  build(): BattleResultDto {
    return { ...this.base } as BattleResultDto;
  }
}
