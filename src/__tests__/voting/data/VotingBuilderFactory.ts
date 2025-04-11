import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './voting/createStartItemVotingParamsDtoBuilder';
import CreatePlayerDtoBuilder from './player/createPlayerDtoBuilder';
import PlayerBuilder from './player/playerBuilder';
import FleaMarketItemDtoBuilder from './FleaMarketItem/FleaMarketItemDtoBuilder';
import VotingDtoBuilder from './voting/VotingDtoBuilder';
import APIErrorBuilder from './controller/APIErrorBuilder';
import OrganizerBuilder from './organizer/OrganizerBuilder';


type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'CreatePlayerDtoBuilder'
  | 'Player'
  | 'FleaMarketItemDto'
  | 'VotingDto'
  | 'ApiError'
  | 'Organizer'
  ;

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
  CreatePlayerDtoBuilder: CreatePlayerDtoBuilder;
  Player: PlayerBuilder;
  FleaMarketItemDto: FleaMarketItemDtoBuilder;
  VotingDto: VotingDtoBuilder;
  ApiError: APIErrorBuilder;
  Organizer: OrganizerBuilder;
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
      case 'ApiError':
              return new APIErrorBuilder() as BuilderMap[T];
      case 'Organizer':
              return new OrganizerBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
