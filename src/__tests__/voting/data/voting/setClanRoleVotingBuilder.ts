import { VotingBuilder } from './VotingBuilder';
import { SetClanRole } from '../../../../voting/schemas/setClanRole.schema';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { SetClanRoleVoting } from '../../../../voting/schemas/setClanRoleVoting.schema';

export class SetClanRoleVotingBuilder extends VotingBuilder {
  setClanRole: SetClanRole;

  setSetClanRole(setClanRole: SetClanRole) {
    this.setClanRole = setClanRole;
    return this;
  }

  override build() {
    return {
      ...this.base,
      setClanRole: this.setClanRole,
      type: VotingType.SET_CLAN_ROLE,
    } as SetClanRoleVoting;
  }
}
