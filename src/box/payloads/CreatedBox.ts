import { Box } from '../schemas/box.schema';
import { Player } from '../../player/player.schema';
import { Clan } from '../../clan/clan.schema';
import { Chat } from '../../chat/chat.schema';

export class CreatedBox extends Box {
  adminPlayer: Player;

  clans: Clan[];
  chat: Chat;
}
