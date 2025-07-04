import Tester from '../../../../box/accountClaimer/payloads/tester';
import { ProfileDto } from '../../../../profile/dto/profile.dto';
import { Player } from '../../../../player/schemas/player.schema';
import { Clan } from '../../../../clan/clan.schema';

export default class TesterBuilder {
  private readonly base: Partial<Tester> = {
    Profile: undefined,
    Player: undefined,
    Clan: undefined,
  };

  build(): Tester {
    return { ...this.base } as Tester;
  }

  setProfile(profile: ProfileDto) {
    this.base.Profile = { ...profile };
    return this;
  }

  setPlayer(player: Player) {
    this.base.Player = { ...player };
    return this;
  }

  setIsClaimed(clan: Clan) {
    this.base.Clan = { ...clan };
    return this;
  }
}
