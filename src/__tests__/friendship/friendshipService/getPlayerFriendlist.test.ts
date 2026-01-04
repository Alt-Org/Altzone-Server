import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import { ObjectId } from 'mongodb';
import { createMockFriendships } from '../data/mockData/createData.mock';
import { Friendship } from 'src/friendship/friendship.schema';

describe('Friendship.getPlayerFriendlist() test suite', () => {
  let friendshipService: FriendshipService;

  const player1_id = new ObjectId().toString();
  const player2_id = new ObjectId().toString();
  const player3_id = new ObjectId().toString();

  const friendshipConfigs: Partial<Friendship>[] = [
    {
      playerA: player1_id,
      playerB: player2_id,
      status: FriendshipStatus.ACCEPTED,

    },
    {
      playerA: player1_id,
      playerB: player3_id,
      status: FriendshipStatus.ACCEPTED,

    },
    {
      playerA: player2_id,
      playerB: player3_id,
      status: FriendshipStatus.PENDING,
      requester: player2_id,
    },
  ];

  beforeEach(async () => {
    friendshipService = await FriendshipModule.getFriendshipService();

    await createMockFriendships(friendshipConfigs);
  });

  it('Should get two friendships for player1', async () => {
    const [friendships, err] = await friendshipService.getPlayerFriendlist(
      player1_id.toString(),
    );

    expect(err).toBeNull();
    expect(friendships).toHaveLength(2);
  });

  it('Should return an empty array if no player_id match the filter', async () => {
    const randomPlayer_id = new ObjectId();
    const [friendships, err] = await friendshipService.getPlayerFriendlist(
      randomPlayer_id.toString(),
    );

    expect(err).toContainSE_NOT_FOUND();
    expect(friendships).toBeNull();
  });

  it('Should get only one friendship for player2', async () => {
    const [friendships, err] = await friendshipService.getPlayerFriendlist(
      player2_id.toString(),
    );

    expect(err).toBeNull();
    expect(friendships).toHaveLength(1);
  });
});
