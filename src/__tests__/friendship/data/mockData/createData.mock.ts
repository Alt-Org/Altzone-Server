import { Player } from '../../../../player/schemas/player.schema';
import FriendshipModule from '../../modules/friendship.module';
import PlayerBuilder from '../../../player/data/player/playerBuilder';
import { Clan } from '../../../../clan/clan.schema';
import ClanBuilder from '../../../clan/data/clan/ClanBuilder';
import { Friendship } from 'src/friendship/friendship.schema';
import FriendshipBuilderFactory from '../friendshipBuilderFactory';

export async function createMockFriendships(
  overides: Partial<Friendship>[]
): Promise<void> {
  const model = FriendshipModule.getFriendshipModel();

  for (const overide of overides) {
    const builder = FriendshipBuilderFactory.getBuilder('Friendship')
      .setPlayerA(overide.playerA)
      .setPlayerB(overide.playerB)
      .setStatus(overide.status);

    if (overide.requester) builder.setRequester(overide.requester);
    await model.create(builder.build());
  }
}

export async function createMockPlayers(
  overides: Partial<Player>[]
): Promise<void> {
  const model = FriendshipModule.getPlayerModel();

  for (const overide of overides) {
    const builder = new PlayerBuilder()
      .setId(overide._id)
      .setName(overide.name)
      .setUniqueIdentifier(overide.uniqueIdentifier)
      .setClanId(overide.clan_id)
      .build();

    await model.create(builder);
  }
}

export async function createMockClans(
  overides: Partial<Clan>[]
): Promise<void> {
  const model = FriendshipModule.getClanModel();

  for (const overide of overides) {
    const builder = new ClanBuilder()
      .setId(overide._id)
      .setName(overide.name)
      .build();

    await model.create(builder);
  }
}
