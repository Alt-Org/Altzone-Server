import {JoinService} from "../../../../clan/join/join.service";
import ClanBuilderFactory from "../../data/clanBuilderFactory";
import ClanModule from "../../modules/clan.module";
import PlayerModule from "../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {MongooseError} from "mongoose";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";

describe('JoinService.readOneById() test suite', () => {
    let joinService: JoinService;
    const joinBuilder = ClanBuilderFactory.getBuilder('Join');
    const join = joinBuilder.build();
    const joinModel = ClanModule.getJoinModel();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clan = clanBuilder.build();

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const player = playerBuilder.build();

    beforeEach(async () => {
        const playerResp = await playerModel.create(player);
        player._id = playerResp._id.toString();
        const clanResp1 = await clanModel.create(clan);
        clan._id = clanResp1._id.toString();

        join.player_id = player._id;
        join.clan_id = clan._id;
        const joinResp1 = await joinModel.create(join);
        join._id = joinResp1._id;

        joinService = await ClanModule.getJoinService();
    });

    it('Should find existing join request from DB', async () => {
         const resp = await joinService.readOneById(join._id);

        const data = clearDBRespDefaultFields(resp['data']['Join']);

        expect(data).toEqual(expect.objectContaining(join));
    });

    it('Should return null for non-existing join request', async () => {
        const resp = await joinService.readOneById(getNonExisting_id());

        expect(resp).toBeNull();
    });

    it('Should throw MongooseError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        await expect(joinService.readOneById(invalid_id)).rejects.toThrow(MongooseError);
    });
});