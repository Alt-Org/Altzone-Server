import { Types } from 'mongoose';
import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipBuilderFactory from '../data/friendshipBuilderFactory';
import FriendshipModule from '../modules/friendship.module';
import { Friendship } from '../../../friendship/friendship.schema';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';

describe('Friendship.getFriendRequests() test suites', () => {
  let friendshipService: FriendshipService;
  const friendshipModel = FriendshipModule.getFriendshipModel();

  const player1_id = new Types.ObjectId();
  const player2_id = new Types.ObjectId();
  const player3_id = new Types.ObjectId();
  const player4_id = new Types.ObjectId();

  const createdFriendships: Friendship[] = [];

  beforeAll(() => {
    const friendshipConfigs = [
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

    for (const config of friendshipConfigs) {
      const friendshipBuilder =
        FriendshipBuilderFactory.getBuilder('Friendship');

      friendshipBuilder
        .setPlayerA(config.playerA)
        .setPlayerB(config.playerB)
        .setStatus(config.status);

      if (config.requester) {
        friendshipBuilder.setRequester(config.requester);
      }

      createdFriendships.push(friendshipBuilder.build());
    }
  });

  beforeEach(async () => {
    await friendshipModel.deleteMany({});
    friendshipService = await FriendshipModule.getFriendshipService();

    await friendshipModel.create(createdFriendships);
  });

  it('Should get two friendship requests for player1', async () => {
    const [friendships, err] = await friendshipService.getFriendRequests(
      player1_id.toString(),
    );

    expect(err).toBeNull();
    expect(friendships).toHaveLength(2);
  });

  it('Should get one friendship request for player2', async () => {
    const [friendships, err] = await friendshipService.getFriendRequests(
      player2_id.toString(),
    );

    expect(err).toBeNull();
    expect(friendships).toHaveLength(1);
  });

  it('should return NOT_FOUND for player4', async () => {
    const [friendships, err] = await friendshipService.getFriendRequests(
      player4_id.toString(),
    );

    expect(err).toContainSE_NOT_FOUND();
    expect(friendships).toBeNull();
  });

  it('Should avoid status ACCEPTED and return one friendship request', async () => {
    const [friendships, err] = await friendshipService.getFriendRequests(
      player3_id.toString(),
    );

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
