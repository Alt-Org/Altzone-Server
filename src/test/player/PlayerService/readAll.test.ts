import {PlayerService} from "../../../player/player.service";
import PlayerBuilderFactory from "../data/playerBuilderFactory";
import PlayerModule from "../modules/player.module";

describe('PlayerService.readAll() test suite', () => {
    let playerService: PlayerService;
    const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
    const name1 = 'user1';
    const name2 = 'user2';

    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        await playerModel.deleteMany({});
        playerService = await PlayerModule.getPlayerService();

        const playerToCreate1 = playerBuilder.setName(name1).setUniqueIdentifier(name1).build();
        await playerModel.create(playerToCreate1);

        const playerToCreate2 = playerBuilder.setName(name2).setUniqueIdentifier(name2).build();
        await playerModel.create(playerToCreate2);
    });

    it('Should retrieve all players based on query filter', async () => {
        const query = { filter: { name: name1 } } as any;
        const resp = await playerService.readAll(query);

        const foundPlayers = resp['data']['Player'];

        expect(foundPlayers).toHaveLength(1);
        expect(foundPlayers[0]).toEqual(expect.objectContaining({ name: name1 }));
    });

    it('Should retrieve return exactly one player if limit set to 1', async () => {
        const query = { filter: undefined, select: undefined, limit: 1 } as any;
        const resp = await playerService.readAll(query);

        const foundPlayer = resp['data']['Player'];

        expect(foundPlayer).toHaveLength(1);
    });

    it('Should retrieve all players if no filter is specified', async () => {
        const query = {filter: undefined, select: undefined} as any;
        const resp = await playerService.readAll(query);
        const foundPlayers = resp['data']['Player'];

        expect(foundPlayers).toHaveLength(2);
    });

    it('Should return an empty array if select is null', async () => {
        const query = { select: null } as any;
        const resp = await playerService.readAll(query);
        const foundPlayer = resp['data']['Player'];

        expect(foundPlayer).toHaveLength(0);
    });

    it('Should return empty response if no player match the filter', async () => {
        const query = { filter: { name: 'non-existent' } } as any;
        const resp = await playerService.readAll(query);
        const foundPlayers = resp['data']['Player'];

        expect(foundPlayers).toHaveLength(0);
    });
});