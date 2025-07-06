import { Box } from '../schemas/box.schema';
import { Player } from '../../player/schemas/player.schema';

export class CreatedBox extends Box {
  adminPlayer: Player;
}
