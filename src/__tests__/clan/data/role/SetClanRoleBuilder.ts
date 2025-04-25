import SetClanRole from '../../../../clan/role/payloads/SetClanRole';
import { ObjectId } from 'mongodb';

export default class SetClanRoleBuilder {
  private readonly base: Partial<SetClanRole> = {
    player_id: new ObjectId(),
    role_id: new ObjectId(),
  };

  build(): SetClanRole {
    return { ...this.base } as SetClanRole;
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
