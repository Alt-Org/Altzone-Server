import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';
import FriendshipBuilderFactory from '../data/friendshipBuilderFactory';
import { Friendship } from '../../../friendship/friendship.schema';
import { Types } from 'mongoose';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';

describe('Friendship.getPlayerFriendlist() test suite', () => {
  let friendshipService: FriendshipService;
  const friendshipModel = FriendshipModule.getFriendshipModel();
  const friendshipBuilder = FriendshipBuilderFactory.getBuilder('Friendship');

  const player1_id = new Types.ObjectId();
  const player2_id = new Types.ObjectId();
  const player3_id = new Types.ObjectId();

  const createdFriendships: Friendship[] = [];

  beforeAll(() => {
    const friendshipToCreate1 = friendshipBuilder
      .setPlayerA(player1_id)
      .setPlayerB(player2_id)
      .setStatus(FriendshipStatus.ACCEPTED)
      .build();

    createdFriendships.push(friendshipToCreate1);

    const friendshipToCreate2 = friendshipBuilder
      .setPlayerA(player1_id)
      .setPlayerB(player3_id)
      .setStatus(FriendshipStatus.ACCEPTED)
      .build();

    createdFriendships.push(friendshipToCreate2);

    const friendshipToCreate3 = friendshipBuilder
      .setPlayerA(player2_id)
      .setPlayerB(player3_id)
      .setStatus(FriendshipStatus.PENDING)
      .setRequester(player2_id)
      .build();

    createdFriendships.push(friendshipToCreate3);
  });

  beforeEach(async () => {
    await friendshipModel.deleteMany({});
    friendshipService = await FriendshipModule.getFriendshipService();

    await friendshipModel.create(createdFriendships);
  });

  it('Should get two friendships for player1', async () => {
    const [friendships, err] = await friendshipService.getPlayerFriendlist(
      player1_id.toString(),
    );

    expect(err).toBeNull();
    expect(friendships).toHaveLength(2);
  });

  it('Should return an empty array if no player_id match the filter', async () => {
    const randomPlayer_id = new Types.ObjectId();
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
