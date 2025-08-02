import ClanBuilder from './clan/ClanBuilder';
import CreateClanDtoBuilder from './clan/CreateClanDtoBuilder';
import JoinRequestDtoBuilder from './clan/join/JoinRequestDtoBuilder';
import RemovePlayerDtoBuilder from './clan/join/RemovePlayerDtoBuilder';
import UpdateClanDtoBuilder from './clan/UpdateClanDtoBuilder';
import ClanRoleBuilder from './role/ClanRoleBuilder';
import CreateClanRoleDtoBuilder from './role/CreateClanRoleDtoBuilder';
import UpdateClanRoleDtoBuilder from './role/UpdateClanRoleDtoBuilder';
import SetClanRoleBuilder from './role/SetClanRoleBuilder';
import ClanDtoBuilder from './clan/ClanDtoBuilder';
import StallBuilder from './clan/stall/StallBuilder';
import AdPosterBuilder from './clan/stall/AdPosterBuilder';

type BuilderName =
  | 'CreateClanDto'
  | 'UpdateClanDto'
  | 'Clan'
  | 'ClanDto'
  | 'JoinRequestDto'
  | 'RemovePlayerDTO'
  | 'ClanRole'
  | 'CreateClanRoleDto'
  | 'UpdateClanRoleDto'
  | 'SetClanRole'
  | 'AdPoster'
  | 'Stall';

type BuilderMap = {
  CreateClanDto: CreateClanDtoBuilder;
  UpdateClanDto: UpdateClanDtoBuilder;
  Clan: ClanBuilder;
  ClanDto: ClanDtoBuilder;
  JoinRequestDto: JoinRequestDtoBuilder;
  RemovePlayerDTO: RemovePlayerDtoBuilder;
  ClanRole: ClanRoleBuilder;
  CreateClanRoleDto: CreateClanRoleDtoBuilder;
  UpdateClanRoleDto: UpdateClanRoleDtoBuilder;
  SetClanRole: SetClanRoleBuilder;
  AdPoster: AdPosterBuilder;
  Stall: StallBuilder;
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
      case 'ClanDto':
        return new ClanDtoBuilder() as BuilderMap[T];
      case 'JoinRequestDto':
        return new JoinRequestDtoBuilder() as BuilderMap[T];
      case 'RemovePlayerDTO':
        return new RemovePlayerDtoBuilder() as BuilderMap[T];
      case 'ClanRole':
        return new ClanRoleBuilder() as BuilderMap[T];
      case 'CreateClanRoleDto':
        return new CreateClanRoleDtoBuilder() as BuilderMap[T];
      case 'UpdateClanRoleDto':
        return new UpdateClanRoleDtoBuilder() as BuilderMap[T];
      case 'SetClanRole':
        return new SetClanRoleBuilder() as BuilderMap[T];
      case 'AdPoster':
        return new AdPosterBuilder() as BuilderMap[T];
      case 'Stall':
        return new StallBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
