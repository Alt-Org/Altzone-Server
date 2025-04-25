import SetClanRoleDto from '../../../../clan/role/dto/setClanRole.dto';
import { ObjectId } from 'mongodb';

export default class SetClanRoleBuilder {
  private readonly base: Partial<SetClanRoleDto> = {
    player_id: new ObjectId(),
    role_id: new ObjectId(),
  };

  build(): SetClanRoleDto {
    return { ...this.base } as SetClanRoleDto;
  }

  setPlayerId(playerId: string | ObjectId) {
    this.base.player_id = playerId;
    return this;
  }

  setRoleId(roleId: string | ObjectId) {
    this.base.role_id = roleId;
    return this;
  }
}
