import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './voting/createStartItemVotingParamsDtoBuilder';
import CreatePlayerDtoBuilder from './player/createPlayerDtoBuilder';
import PlayerBuilder from './player/playerBuilder';
import FleaMarketItemDtoBuilder from './FleaMarketItem/FleaMarketItemDtoBuilder';


type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'CreatePlayerDtoBuilder'
  | 'Player'
  | 'FleaMarketItemDto'
  
  ;

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
  CreatePlayerDtoBuilder: CreatePlayerDtoBuilder;
  Player: PlayerBuilder;
  FleaMarketItemDto: FleaMarketItemDtoBuilder;
};

export default class VotingBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreateVotingDto':
        return new CreateVotingDtoBuilder() as BuilderMap[T];
      case 'CreateStartItemVotingParamsDto':
        return new CreateStartItemVotingParamsDtoBuilder() as BuilderMap[T];
      case 'Player':
              return new PlayerBuilder() as BuilderMap[T];
      case 'CreatePlayerDtoBuilder':
              return new CreatePlayerDtoBuilder() as BuilderMap[T];
      case 'FleaMarketItemDto':
              return new FleaMarketItemDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
