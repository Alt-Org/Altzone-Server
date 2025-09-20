import { BattleResultDtoBuilder } from './gameData/BattleResultDtoBuilder';
import { GameBuilder } from './gameData/GameBuilder';

type BuilderName = 'Game'  | 'BattleResultDto';

type BuilderMap = {
  Game: GameBuilder;
  BattleResultDto: BattleResultDtoBuilder;
};

export default class GameDataBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'Game':
        return new GameBuilder() as BuilderMap[T];
      case 'BattleResultDto':
        return new BattleResultDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
