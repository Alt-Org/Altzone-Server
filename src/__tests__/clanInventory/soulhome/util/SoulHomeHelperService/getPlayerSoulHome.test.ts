import ClanInventoryBuilderFactory from "../../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../../modules/soulhome.module";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";
import PlayerModule from "../../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../../player/data/playerBuilderFactory";
import SoulHomeHelperService from "../../../../../clanInventory/soulhome/utils/soulHomeHelper.service";
import {getNonExisting_id} from "../../../../test_utils/util/getNonExisting_id";

describe('SoulHomeHelperService.getPlayerSoulHome() test suite', () => {
    let soulHomeHelper: SoulHomeHelperService;
    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.build();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const existingPlayer = playerBuilder.build();

    beforeEach(async () => {
        soulHomeHelper = await SoulhomeModule.getSoulHomeHelperService();

        const clanResp = await clanModel.create(existingClan);
        existingClan._id = clanResp._id.toString();

        existingSoulHome.clan_id = existingClan._id;
        const soulHomeResp = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = soulHomeResp._id;
    });


    it('Should return soul home of a clan where player is a member', async () => {
        existingPlayer.clan_id = existingClan._id;
        const playerResp = await playerModel.create(existingPlayer);
        existingPlayer._id = playerResp._id;

        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(existingPlayer._id);

        expect(errors).toBeNull();
        expect(soulHome).toEqual(expect.objectContaining(existingSoulHome));
    });

    it('Should return NOT_FOUND if the player is not a member of any clan where player is a member', async () => {
        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(existingPlayer._id);

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if the player does not exists', async () => {
        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(getNonExisting_id());

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});