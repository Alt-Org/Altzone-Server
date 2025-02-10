import {JoinService} from "../../../../clan/join/join.service";
import ClanBuilderFactory from "../../data/clanBuilderFactory";
import ClanModule from "../../modules/clan.module";
import PlayerModule from "../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('JoinService.readAll() test suite', () => {
    let joinService: JoinService;
    const joinBuilder = ClanBuilderFactory.getBuilder('Join');
    const join1 = joinBuilder.build();
    const join2 = joinBuilder.build();
    const joinModel = ClanModule.getJoinModel();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clan1 = clanBuilder.setName('clan1').build();
    const clan2 = clanBuilder.setName('clan2').build();

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const player = playerBuilder.build();

    beforeEach(async () => {
        const playerResp = await playerModel.create(player);
        player._id = playerResp._id.toString();
        const clanResp1 = await clanModel.create(clan1);
        clan1._id = clanResp1._id.toString();
        const clanResp2 = await clanModel.create(clan2);
        clan2._id = clanResp2._id.toString();

        join1.player_id = player._id;
        join1.clan_id = clan1._id;
        const joinResp1 = await joinModel.create(join1);
        join1._id = joinResp1._id.toString();

        join2.player_id = player._id;
        join2.clan_id = clan2._id;
        const joinResp2 = await joinModel.create(join2);
        join2._id = joinResp2._id.toString();

        joinService = await ClanModule.getJoinService();
    });

    it('Should retrieve all join requests based on query filter', async () => {
        const query = { filter: { player_id: player._id } } as any;
        const resp = await joinService.readAll(query);

        const foundJoins = resp['data']['Join'];

        expect(foundJoins).toHaveLength(2);
        expect(foundJoins[0]).toEqual(expect.objectContaining({ player_id: player._id }));
    });

    it('Should retrieve return exactly one join request if limit set to 1', async () => {
        const query = { filter: undefined, select: undefined, limit: 1 } as any;
        const resp = await joinService.readAll(query);

        const foundJoin = resp['data']['Join'];

        expect(foundJoin).toHaveLength(1);
    });

    it('Should retrieve all join requests if no filter is specified', async () => {
        const query = {filter: undefined, select: undefined} as any;
        const resp = await joinService.readAll(query);
        const foundJoins = resp['data']['Join'];

        expect(foundJoins).toHaveLength(2);
    });

    it('Should return an empty array if select is null', async () => {
        const query = { select: null } as any;
        const resp = await joinService.readAll(query);
        const foundJoin = resp['data']['Join'];

        expect(foundJoin).toHaveLength(0);
    });

    it('Should return empty response if no join requests match the filter', async () => {
        const query = { filter: { name: getNonExisting_id() } } as any;
        const resp = await joinService.readAll(query);
        const foundJoins = resp['data']['Join'];

        expect(foundJoins).toHaveLength(0);
    });
});