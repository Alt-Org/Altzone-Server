import ClanInventoryBuilderFactory from "../../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../../modules/soulhome.module";
import {getNonExisting_id} from "../../../../test_utils/util/getNonExisting_id";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";
import LoggedUser from "../../../../test_utils/const/loggedUser";
import PlayerModule from "../../../../player/modules/player.module";
import SoulHomeHelperService from "../../../../../clanInventory/soulhome/utils/soulHomeHelper.service";
import {clearDBRespDefaultFields} from "../../../../test_utils/util/removeDBDefaultFields";


describe('RoomHelperService.getPlayerSoulHome() test suite', () => {
    let soulHomeHelper: SoulHomeHelperService;
    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.build();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    const existingPlayer = LoggedUser.getPlayer();
    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        soulHomeHelper = await SoulhomeModule.getSoulHomeHelperService();

        const clanResp = await clanModel.create(existingClan);
        existingClan._id = clanResp._id.toString();

        await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: existingClan._id });
        existingPlayer.clan_id = existingClan._id;

        existingSoulHome.clan_id = existingClan._id;
        const createdSoulHome = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = createdSoulHome._id;
    });

    it('Should find existing soul home from DB', async () => {
        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(existingPlayer._id);

        const clearedSoulHome = clearDBRespDefaultFields(soulHome);

        expect(errors).toBeNull();
        expect(clearedSoulHome).toEqual(expect.objectContaining(existingSoulHome));
    });

    it('Should return NOT_FOUND if player does not exists', async () => {
        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(getNonExisting_id());

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if player does not belong to any Clan', async () => {
        await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: null });

        const [soulHome, errors] = await soulHomeHelper.getPlayerSoulHome(existingPlayer._id);

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});