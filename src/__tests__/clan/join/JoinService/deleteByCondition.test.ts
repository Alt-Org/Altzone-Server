import {JoinService} from "../../../../clan/join/join.service";
import ClanBuilderFactory from "../../data/clanBuilderFactory";
import ClanModule from "../../modules/clan.module";
import PlayerModule from "../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('JoinService.deleteByCondition() test suite', () => {
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

    it('Should delete a single join request based on condition if options.isOne is true', async () => {
        const condition = { clan_id: clan1._id };
        const result = await joinService.deleteByCondition(condition, { isOne: true });

        expect(result['deletedCount']).toBe(1);

        const deletedJoin = await joinModel.findOne(condition);
        expect(deletedJoin).toBeNull();
    });

    it('Should not delete join request, which does not match the condition', async () => {
        const condition = { clan_id: clan1._id };
        await joinService.deleteByCondition({ clan_id: undefined }, { isOne: true });

        const joinRequest = await joinModel.findOne(condition);
        expect(joinRequest).not.toBeNull();
        expect(joinRequest.clan_id).toBe(clan1._id);
    });

    it('Should delete multiple join requests based on condition if options.isOne is false or undefined', async () => {
        const condition = { clan_id: { $in: [clan1._id, clan2._id] } };
        const result = await joinService.deleteByCondition(condition);

        expect(result['deletedCount']).toBe(2);

        const deletedJoins = await joinModel.find(condition);
        expect(deletedJoins.length).toBe(0);
    });

    it('Should return null if no join requests match the condition for single deletion', async () => {
        const condition = { clan_id: getNonExisting_id() };
        const result = await joinService.deleteByCondition(condition, { isOne: true });

        expect(result).toBeNull();
    });

    it('Should return null if no join requests match the condition for multiple deletion', async () => {
        const condition = { player_id: getNonExisting_id() };
        const result = await joinService.deleteByCondition(condition);

        expect(result).toBeNull();
    });
});