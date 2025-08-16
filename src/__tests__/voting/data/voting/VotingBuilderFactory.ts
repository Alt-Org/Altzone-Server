import CreateVotingDtoBuilder from './createVotingDtoBuilder';
import CreateStartItemVotingParamsDtoBuilder from './createStartItemVotingParamsDtoBuilder';
import VotingDtoBuilder from './VotingDtoBuilder';
import OrganizerBuilder from '../organizer/OrganizerBuilder';
import VoteBuilder from './VoteBuilder';
import { VotingBuilder } from './VotingBuilder';
import { FleaMarketItemVotingBuilder } from './FleaMarketItemVotingBuilder';

type BuilderName =
  | 'CreateVotingDto'
  | 'CreateStartItemVotingParamsDto'
  | 'VotingDto'
  | 'Vote'
  | 'Voting'
  | 'FleaMarketItemVoting'
  | 'Organizer';

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  CreateStartItemVotingParamsDto: CreateStartItemVotingParamsDtoBuilder;
  VotingDto: VotingDtoBuilder;
  Vote: VoteBuilder;
  Voting: VotingBuilder;
  FleaMarketItemVoting: FleaMarketItemVotingBuilder;
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
      case 'Voting':
        return new VotingBuilder() as BuilderMap[T];
      case 'FleaMarketItemVoting':
        return new FleaMarketItemVotingBuilder() as BuilderMap[T];
      case 'Organizer':
        return new OrganizerBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
