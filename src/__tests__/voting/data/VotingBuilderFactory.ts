import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './voting/createStartItemVotingParamsDtoBuilder';
import CreatePlayerDtoBuilder from './player/createPlayerDtoBuilder';
import PlayerBuilder from './player/playerBuilder';
import FleaMarketItemDtoBuilder from './FleaMarketItem/FleaMarketItemDtoBuilder';
import { VotingDto } from '../../../voting/dto/voting.dto';
import VotingDtoBuilder from './voting/VotingDtoBuilder';


type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'CreatePlayerDtoBuilder'
  | 'Player'
  | 'FleaMarketItemDto'
  | 'VotingDto'
  
  ;

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
  CreatePlayerDtoBuilder: CreatePlayerDtoBuilder;
  Player: PlayerBuilder;
  FleaMarketItemDto: FleaMarketItemDtoBuilder;
  VotingDto: VotingDtoBuilder;
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
      case 'VotingDto':
              return new VotingDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
