import { OnlinePlayerBuilder } from './onlinePlayers/OnlinePlayerBuilder';
import { AddOnlinePlayerBuilder } from './onlinePlayers/AddOnlinePlayerBuilder';

type BuilderName = 'OnlinePlayer' | 'AddOnlinePlayer';

type BuilderMap = {
  OnlinePlayer: OnlinePlayerBuilder;
  AddOnlinePlayer: AddOnlinePlayerBuilder;
};

export default class OnlinePlayersBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'OnlinePlayer':
        return new OnlinePlayerBuilder() as BuilderMap[T];
      case 'AddOnlinePlayer':
        return new AddOnlinePlayerBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
