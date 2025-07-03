import { Player } from '../../../player/schemas/player.schema';
import { Clan } from '../../../clan/clan.schema';
import { ProfileDto } from '../../../profile/dto/profile.dto';

export default class Tester {
  /**
   * Tester's profile
   */
  Profile: ProfileDto;

  /**
   * Testers player
   */
  Player: Player;

  /**
   * Testers clan
   */
  Clan: Clan;
}
