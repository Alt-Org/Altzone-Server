import { GameBuilder } from './gameData/GameBuilder';

type BuilderName = 'Game';

type BuilderMap = {
  Game: GameBuilder;
};

export default class GameDataBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'Game':
        return new GameBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
