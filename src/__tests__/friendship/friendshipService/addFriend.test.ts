import { ObjectId } from 'mongodb';
import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import {
    createMockClans,
    createMockFriendships,
    createMockPlayers,
} from '../data/mockData/createData.mock';
import { Friendship } from 'src/friendship/friendship.schema';

describe('FriendshipService.sendNewFriendRequestNotification()', () => {
    let friendshipService: FriendshipService;

    const player1_id = new ObjectId().toString();
    const player2_id = new ObjectId().toString();
    const player3_id = new ObjectId().toString();

    const clan_id = new ObjectId().toString();

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
            status: FriendshipStatus.ACCEPTED,
        },
    ];

    beforeEach(async () => {
        friendshipService = await FriendshipModule.getFriendshipService();

        await createMockClans([{ _id: clan_id, name: 'TestClan' }]);
        await createMockPlayers([
            {
                _id: player1_id,
                name: 'Player1',
                clan_id,
                uniqueIdentifier: 'unique-1',
            },
            {
                _id: player2_id,
                name: 'Player2',
                clan_id,
                uniqueIdentifier: 'unique-2',
            },
            {
                _id: player3_id,
                name: 'Player3',
                clan_id,
                uniqueIdentifier: 'unique-3',
            },
        ]);
        await createMockFriendships(friendshipConfigs);
    });

    it('Should return undefined if addFriend is successful', async () => {
        // void function if success
        await expect(friendshipService.addFriend(player2_id, player3_id))
            .resolves
            .toBeUndefined();
    });

    it(
        'Should return NOT_UNIQUE from pairkey if 2 players have friendship with status PENDING',
        async () => {
            const [friendship, err] = await friendshipService.addFriend(
                player1_id,
                player2_id
            );

            expect(err).toContainSE_NOT_UNIQUE();
            expect(friendship).toBeNull();
        }
    );

    it(
        'Should return NOT_UNIQUE from pairkey if 2 players have friendship with status ACCEPTED',
        async () => {
            const [friendship, err] = await friendshipService.addFriend(
                player1_id,
                player3_id
            );

            expect(err).toContainSE_NOT_UNIQUE();
            expect(friendship).toBeNull();
        }
    );
});