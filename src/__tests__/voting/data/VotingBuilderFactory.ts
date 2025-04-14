import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './voting/createStartItemVotingParamsDtoBuilder';
import VotingDtoBuilder from './voting/VotingDtoBuilder';
import APIErrorBuilder from './controller/APIErrorBuilder';
import OrganizerBuilder from './organizer/OrganizerBuilder';
import VoteBuilder from './voting/VoteBuilder';

type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'VotingDto'
  | 'ApiError'
  | 'Organizer'
  | 'Vote';

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
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
