import ClanBuilder from './clan/ClanBuilder';
import CreateClanDtoBuilder from './clan/CreateClanDtoBuilder';
import JoinRequestDtoBuilder from './clan/join/JoinRequestDtoBuilder';
import RemovePlayerDtoBuilder from './clan/join/RemovePlayerDtoBuilder';
import UpdateClanDtoBuilder from './clan/UpdateClanDtoBuilder';
import JoinBuilder from './clan/join/JoinBuilder';

type BuilderName =
  | 'CreateClanDto'
  | 'UpdateClanDto'
  | 'Clan'
  | 'JoinRequestDto'
  | 'RemovePlayerDTO'
  | 'Join';

type BuilderMap = {
  CreateClanDto: CreateClanDtoBuilder;
  UpdateClanDto: UpdateClanDtoBuilder;
  Clan: ClanBuilder;
  JoinRequestDto: JoinRequestDtoBuilder;
  RemovePlayerDTO: RemovePlayerDtoBuilder;
  Join: JoinBuilder;
};

export default class ClanBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreateClanDto':
        return new CreateClanDtoBuilder() as BuilderMap[T];
      case 'UpdateClanDto':
        return new UpdateClanDtoBuilder() as BuilderMap[T];
      case 'Clan':
        return new ClanBuilder() as BuilderMap[T];
      case 'JoinRequestDto':
        return new JoinRequestDtoBuilder() as BuilderMap[T];
      case 'RemovePlayerDTO':
        return new RemovePlayerDtoBuilder() as BuilderMap[T];
      case 'Join':
        return new JoinBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
