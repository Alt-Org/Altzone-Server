import {SoulHomeService} from "../../../../clanInventory/soulhome/soulhome.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import ClanModule from "../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";
import RoomModule from "../../modules/room.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";


describe('SoulHomeService.deleteOneById() test suite', () => {
    let soulHomeService: SoulHomeService;
    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.build();

    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const room1 = roomBuilder.build();
    const room2 = roomBuilder.build();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    beforeEach(async () => {
        soulHomeService = await SoulhomeModule.getSoulHomeService();

        const clanResp = await clanModel.create(existingClan);
        existingClan._id = clanResp._id.toString();

        existingSoulHome.clan_id = existingClan._id;
        const soulHomeResp = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = soulHomeResp._id.toString();

        room1.soulHome_id = existingSoulHome._id;
        room2.soulHome_id = existingSoulHome._id;

        await roomModel.insertMany([room1, room2]);
    });

    it('Should delete the soul home from DB if the _id is valid and return true', async () => {
        const [wasDeleted, errors] = await soulHomeService.deleteOneById(existingSoulHome._id);

        expect(errors).toBeNull();
        expect(wasDeleted).toBeTruthy();

        const deletedSoulHome = await soulHomeModel.findById(existingSoulHome._id);
        expect(deletedSoulHome).toBeNull();
    });

    it('Should delete soul home\'s rooms from DB', async () => {
        await soulHomeService.deleteOneById(existingSoulHome._id);

        const deletedRooms = await roomModel.find({soulHome_id: existingSoulHome._id});
        expect(deletedRooms).toHaveLength(0);
    });

    it('Should return ServiceError NOT_FOUND if the soul home with provided _id does not exist', async () => {
        const nonExisting_id = getNonExisting_id();
        const [wasDeleted, errors] = await soulHomeService.deleteOneById(nonExisting_id);

        expect(wasDeleted).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input _id is null or undefined', async () => {
        const nullInput = async () => await soulHomeService.deleteOneById(null);
        const undefinedInput = async () => await soulHomeService.deleteOneById(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});