import { ObjectId } from "mongodb";
import { FriendshipService } from "../../../friendship/friendship.service"
import FriendshipModule from "../modules/friendship.module";
import { Friendship } from "../../../friendship/friendship.schema";
import { FriendshipStatus } from "../../../friendship/enum/friendship-status.enum";
import FriendshipBuilderFactory from "../data/friendshipBuilderFactory";

describe('FriendshipService.getFriendshipsWithStatus() test suites', () => {
    let friendshipService: FriendshipService;
    const friendshipModel = FriendshipModule.getFriendshipModel();
    const createdFriendships: Friendship[] = [];

    const player1_id = new ObjectId().toString();
    const player2_id = new ObjectId().toString();
    const player3_id = new ObjectId().toString();
    const player4_id = new ObjectId().toString();

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
                playerA: player1_id,
                playerB: player4_id,
                status: FriendshipStatus.PENDING,
                requester: player1_id,
            },
            {
                playerA: player2_id,
                playerB: player3_id,
                status: FriendshipStatus.ACCEPTED,
            },
            {
                playerA: player2_id,
                playerB: player4_id,
                status: FriendshipStatus.ACCEPTED,
            },
            {
                playerA: player3_id,
                playerB: player4_id,
                status: FriendshipStatus.BLOCKED,
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
        await friendshipModel.deleteMany({});
        friendshipService = await FriendshipModule.getFriendshipService();

        await friendshipModel.create(createdFriendships);
    });

    it('Should get all friendship with status PENDING', async () => {
        const [friendships, err] = await friendshipService.getFriendshipsWithStatus(
            player1_id,
            FriendshipStatus.PENDING
        );

        expect(err).toBeNull();
        expect(friendships).toHaveLength(3);
    });

    it('Should get all friendship with status ACCEPTED', async () => {
        const [friendships, err] = await friendshipService.getFriendshipsWithStatus(
            player2_id,
            FriendshipStatus.ACCEPTED
        );

        expect(err).toBeNull();
        expect(friendships).toHaveLength(2);
    });

    it('Should get all friendship with status BLOCKED', async () => {
        const [friendships, err] = await friendshipService.getFriendshipsWithStatus(
            player3_id,
            FriendshipStatus.BLOCKED
        );

        expect(err).toBeNull();
        expect(friendships).toHaveLength(1);
    });

    it('Should return NOT_FOUND if no match player_id', async () => {
        const randomPlayer_id = new ObjectId().toString();
        const [friendships, err] = await friendshipService.getFriendshipsWithStatus(
            randomPlayer_id,
            FriendshipStatus.ACCEPTED
        );

        expect(err).toContainSE_NOT_FOUND();
        expect(friendships).toBeNull();
    });

    it('Should return NOT_FOUND if no match STATUS', async () => {
        const [friendships, err] = await friendshipService.getFriendshipsWithStatus(
            player1_id,
            undefined
        );

        expect(err).toContainSE_NOT_FOUND();
        expect(friendships).toBeNull();
    });
})