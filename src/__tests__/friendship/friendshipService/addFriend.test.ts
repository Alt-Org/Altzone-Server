import { ObjectId } from 'mongodb';
import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipModule from '../modules/friendship.module';
import FriendshipBuilderFactory from '../data/friendshipBuilderFactory';
import { FriendshipStatus } from '../../../friendship/enum/friendship-status.enum';
import { Friendship } from '../../../friendship/friendship.schema';
import {
    createMockClans,
    createMockPlayers,
} from '../data/mockData/createData.mock';

describe('FriendshipService.sendNewFriendRequestNotification()', () => {
    let friendshipService: FriendshipService;
    const clanModel = FriendshipModule.getClanModel();
    const playerModel = FriendshipModule.getPlayerModel();
    const friendshipModel = FriendshipModule.getFriendshipModel();
    const createdFriendships: Friendship[] = [];

    const player1_id = new ObjectId().toString();
    const player2_id = new ObjectId().toString();
    const player3_id = new ObjectId().toString();

    const clan_id = new ObjectId().toString();

    beforeAll(async () => {
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
                status: FriendshipStatus.ACCEPTED,
            },
        ];

        for (const config of friendshipConfigs) {
            const builder = FriendshipBuilderFactory.getBuilder('Friendship');
            builder
                .setPlayerA(config.playerA)
                .setPlayerB(config.playerB)
                .setStatus(config.status);

            if (config.requester) {
                builder.setRequester(config.requester);
            }
            createdFriendships.push(builder.build());
        }
    });

    beforeEach(async () => {
        friendshipService = await FriendshipModule.getFriendshipService();
        await friendshipModel.deleteMany({});
        await clanModel.deleteMany({});
        await playerModel.deleteMany({});

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
        await friendshipModel.create(createdFriendships);
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
