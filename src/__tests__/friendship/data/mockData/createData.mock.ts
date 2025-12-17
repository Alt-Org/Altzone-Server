import { Player } from '../../../../player/schemas/player.schema';
import FriendshipModule from '../../modules/friendship.module';
import PlayerBuilder from '../../../player/data/player/playerBuilder';
import { Clan } from '../../../../clan/clan.schema';
import ClanBuilder from '../../../clan/data/clan/ClanBuilder';

export async function createMockPlayers(
  overides: Partial<Player>[],
): Promise<Player[]> {
  const model = FriendshipModule.getPlayerModel();
  const players: Player[] = [];

  for (const overide of overides) {
    const builder = new PlayerBuilder()
      .setId(overide._id)
      .setName(overide.name)
      .setUniqueIdentifier(overide.uniqueIdentifier)
      .setClanId(overide.clan_id)
      .build();

    const savedPlayer = await model.create(builder);
    players.push(savedPlayer);
  }

  return players;
}

export async function createMockClans(
  overides: Partial<Clan>[],
): Promise<Clan[]> {
  const model = FriendshipModule.getClanModel();
  const clans: Clan[] = [];

  for (const overide of overides) {
    const builder = new ClanBuilder()
      .setId(overide._id)
      .setName(overide.name)
      .build();

    const savedClans = await model.create(builder);
    clans.push(savedClans);
  }

  return clans;
}
