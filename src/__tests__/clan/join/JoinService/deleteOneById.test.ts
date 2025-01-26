import {JoinService} from "../../../../clan/join/join.service";
import ClanBuilderFactory from "../../data/clanBuilderFactory";
import ClanModule from "../../modules/clan.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import PlayerModule from "../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";

describe('JoinService.deleteOneById() test suite', () => {
    let joinService: JoinService;
    const joinBuilder = ClanBuilderFactory.getBuilder('Join');
    const join = joinBuilder.build();
    const joinModel = ClanModule.getJoinModel();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clan1 = clanBuilder.setName('clan1').build();

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const player = playerBuilder.build();

    beforeEach(async () => {
        const playerResp = await playerModel.create(player);
        player._id = playerResp._id.toString();
        const clanResp1 = await clanModel.create(clan1);
        clan1._id = clanResp1._id.toString();

        join.player_id = player._id;
        join.clan_id = clan1._id;
        const joinResp1 = await joinModel.create(join);
        join._id = joinResp1._id.toString();

        joinService = await ClanModule.getJoinService();
    });

    it('Should successfully delete the join request', async () => {
        const result = await joinService.deleteOneById(join._id);

        expect(result['deletedCount']).toBe(1);
        const deletedPlayer = await joinModel.findById(join._id).exec();
        expect(deletedPlayer).toBeNull();
    });

    it('Should return null if join request does not exist', async () => {
        const nonExistingId = getNonExisting_id();

        const result = await joinService.deleteOneById(nonExistingId);

        expect(result).toBeNull();
    });

    it('Should not affect join collection if join request does not exist', async () => {
        const nonExistingId = getNonExisting_id();

        await joinService.deleteOneById(nonExistingId);

        const joinInDB = await joinModel.findById(join._id).exec();

        expect(joinInDB).not.toBeNull();
        expect(joinInDB._id.toString()).toBe(join._id.toString());
    });
});