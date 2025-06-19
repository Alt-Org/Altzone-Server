import { Box } from '../schemas/box.schema';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';

export class CreatedBox extends Box {
  adminPlayer: Player;

  clans: Clan[];
}
