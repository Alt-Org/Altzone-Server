import { Game } from '../../../../gameData/game.schema';
import { ObjectId } from 'mongodb';

export class GameBuilder {
  private readonly base: Game = {
    team1: [],
    team2: [],
    team1Clan: new ObjectId().toString(),
    team2Clan: new ObjectId().toString(),
    winner: 1,
    startedAt: new Date(),
    endedAt: new Date(),
    _id: undefined,
  };

  build(): Game {
    return { ...this.base } as Game;
  }

  setTeam1(team1: string[]): this {
    this.base.team1 = team1;
    return this;
  }

  setTeam2(team2: string[]): this {
    this.base.team2 = team2;
    return this;
  }

  setTeam1Clan(team1Clan: string): this {
    this.base.team1Clan = team1Clan;
    return this;
  }

  setTeam2Clan(team2Clan: string): this {
    this.base.team2Clan = team2Clan;
    return this;
  }

  setWinner(winner: 1 | 2): this {
    this.base.winner = winner;
    return this;
  }

  setStartedAt(date: Date): this {
    this.base.startedAt = date;
    return this;
  }

  setEndedAt(date: Date): this {
    this.base.endedAt = date;
    return this;
  }

  setId(id: string): this {
    this.base._id = id;
    return this;
  }
}
