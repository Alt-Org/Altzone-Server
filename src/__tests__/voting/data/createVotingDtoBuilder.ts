import CreateVotingDtoBuilder from './voting/createVotingDtoBuilder';


type BuilderName =
  | 'CreateVotingDto'
  ;

type BuilderMap = {
  CreateVotingDto: CreateVotingDtoBuilder;
  
};

export default class CreateVotingBuilder {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreateVotingDto':
        return new CreateVotingDtoBuilder() as BuilderMap[T];
      
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
