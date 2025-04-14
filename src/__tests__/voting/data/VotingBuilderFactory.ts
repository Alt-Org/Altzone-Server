import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './voting/createStartItemVotingParamsDtoBuilder';
import CreatePlayerDtoBuilder from './player/createPlayerDtoBuilder';
import PlayerBuilder from './player/playerBuilder';
import VotingDtoBuilder from './voting/VotingDtoBuilder';
import APIErrorBuilder from './controller/APIErrorBuilder';
import OrganizerBuilder from './organizer/OrganizerBuilder';
import VoteBuilder from './voting/VoteBuilder';
import PlayerDtoBuilder from './player/playerDtoBuilder';
import UpdatePlayerDtoBuilder from './player/updatePlayerDtoBuilder';

type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'CreatePlayerDto'
  | 'Player'
  | 'PlayerDto'
  | 'UpdatePlayerDto'
  | 'VotingDto'
  | 'ApiError'
  | 'Organizer'
  | 'Vote';

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
  CreatePlayerDto: CreatePlayerDtoBuilder;
  Player: PlayerBuilder;
  PlayerDto: PlayerDtoBuilder;
  UpdatePlayerDto: UpdatePlayerDtoBuilder;
  VotingDto: VotingDtoBuilder;
  Vote: VoteBuilder;
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
      case 'PlayerDto':
        return new PlayerDtoBuilder() as BuilderMap[T];
      case 'CreatePlayerDto':
        return new CreatePlayerDtoBuilder() as BuilderMap[T];
      case 'UpdatePlayerDto':
        return new UpdatePlayerDtoBuilder() as BuilderMap[T];
      case 'VotingDto':
        return new VotingDtoBuilder() as BuilderMap[T];
      case 'Vote':
        return new VoteBuilder() as BuilderMap[T];
      case 'ApiError':
        return new APIErrorBuilder() as BuilderMap[T];
      case 'Organizer':
        return new OrganizerBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
