import { Clan } from '../../clan/clan.schema';
import { Player } from '../../player/schemas/player.schema';
import { Friendship } from '../friendship.schema';

export type PopulatedFriendship = Omit<Friendship, 'playerA' | 'playerB'> & {
  playerA: Player & { _id: string; clan?: Clan };
  playerB: Player & { _id: string; clan?: Clan };
};
