import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import { ObjectId } from 'mongodb';
import { createMockFriendships } from '../data/mockData/createData.mock';
import { Friendship } from '../../../../src/friendship/friendship.schema';

describe('Friendship.getFriendRequests() test suites', () => {
  let friendshipService: FriendshipService;
  const friendshipModel = FriendshipModule.getFriendshipModel();

  const player1_id = new ObjectId().toString();
  const player2_id = new ObjectId().toString();
  const player3_id = new ObjectId().toString();
  const player4_id = new ObjectId().toString();

  const friendshipConfigs: Partial<Friendship>[] = [
    {
      playerA: player1_id,
      playerB: player2_id,
      status: FriendshipStatus.PENDING,
      requester: player1_id,
    },
    {
      playerA: player1_id,
      playerB: player3_id,
      status: FriendshipStatus.PENDING,
      requester: player1_id,
    },
    {
      playerA: player2_id,
      playerB: player3_id,
      status: FriendshipStatus.ACCEPTED,
    },
    {
      playerA: player1_id,
      playerB: player4_id,
      status: FriendshipStatus.BLOCKED,
    },
  ];

  beforeEach(async () => {
    friendshipService = await FriendshipModule.getFriendshipService();

    await createMockFriendships(friendshipConfigs);
  });

  it('Should get two friendship requests for player1', async () => {
    const [friendships, err] =
      await friendshipService.getFriendRequests(player1_id);

    expect(err).toBeNull();
    expect(friendships).toHaveLength(2);
  });

  it('Should get one friendship request for player2', async () => {
    const [friendships, err] =
      await friendshipService.getFriendRequests(player2_id);

    expect(err).toBeNull();
    expect(friendships).toHaveLength(1);
  });

  it('should return NOT_FOUND for player4', async () => {
    const [friendships, err] =
      await friendshipService.getFriendRequests(player4_id);

    expect(err).toContainSE_NOT_FOUND();
    expect(friendships).toBeNull();
  });

  it('Should avoid status ACCEPTED and return one friendship request', async () => {
    const [friendships, err] =
      await friendshipService.getFriendRequests(player3_id);

    expect(err).toBeNull();
    expect(friendships).toHaveLength(1);
  });

  it('Direct create should fail without requester', async () => {
    const invalidFriendship = {
      playerA: player1_id,
      playerB: player2_id,
      status: FriendshipStatus.PENDING,
    };

    await expect(friendshipModel.create(invalidFriendship)).rejects.toThrow(
      /requester is required when status is PENDING/,
    );
  });

  it('Direct create should fail with wrong requester', async () => {
    const invalidFriendship = {
      playerA: player1_id,
      playerB: player2_id,
      status: FriendshipStatus.PENDING,
      requester: player3_id,
    };

    await expect(friendshipModel.create(invalidFriendship)).rejects.toThrow(
      /requester must be either playerA or playerB/,
    );
  });
});
