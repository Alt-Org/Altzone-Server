import ClanCoinsDtoBuilder from "./clanCoins/createClanCoinsDtoBuilder";

type BuilderName =
  | 'ClanCoinsDto';

type BuilderMap = {
  ClanCoinsDto: ClanCoinsDtoBuilder;
};

export default class PlayerBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'ClanCoinsDto':
        return new ClanCoinsDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
