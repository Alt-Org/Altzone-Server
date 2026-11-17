import { ObjectId } from 'mongodb';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';

describe('FriendshipService.getAcceptedFriendPlayerIds', () => {
  let friendshipService: FriendshipService;
  const friendshipModel = FriendshipModule.getFriendshipModel();

  const playerId = new ObjectId();
  const acceptedFriendA = new ObjectId();
  const acceptedFriendB = new ObjectId();
  const pendingFriend = new ObjectId();
  const blockedFriend = new ObjectId();

  beforeAll(async () => {
    friendshipService = await FriendshipModule.getFriendshipService();
  });

  beforeEach(async () => {
    await friendshipModel.deleteMany({});
    await friendshipModel.create([
      {
        playerA: playerId,
        playerB: acceptedFriendA,
        status: FriendshipStatus.ACCEPTED,
      },
      {
        playerA: acceptedFriendB,
        playerB: playerId,
        status: FriendshipStatus.ACCEPTED,
      },
      {
        playerA: playerId,
        playerB: pendingFriend,
        requester: playerId,
        status: FriendshipStatus.PENDING,
      },
      {
        playerA: playerId,
        playerB: blockedFriend,
        status: FriendshipStatus.BLOCKED,
      },
    ]);
  });

  it('returns only the other participants from accepted friendships', async () => {
    const result = await friendshipService.getAcceptedFriendPlayerIds(
      playerId.toString(),
    );

    expect(result.sort()).toEqual(
      [acceptedFriendA.toString(), acceptedFriendB.toString()].sort(),
    );
  });

  it('returns an empty population when the player has no accepted friends', async () => {
    await expect(
      friendshipService.getAcceptedFriendPlayerIds(new ObjectId().toString()),
    ).resolves.toEqual([]);
  });
});
