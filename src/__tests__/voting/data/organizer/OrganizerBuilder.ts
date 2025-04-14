import { Organizer } from '../../../../voting/dto/organizer.dto';

export default class OrganizerBuilder {
  private readonly base: Partial<Organizer> = {
    player_id: undefined,
    clan_id: undefined,
  };

  build(): Organizer {
    return { ...this.base } as Organizer;
  }

  setPlayerId(playerId: string) {
    this.base.player_id = playerId;
    return this;
  }

  setClanId(clanId: string) {
    this.base.clan_id = clanId;
    return this;
  }
}
