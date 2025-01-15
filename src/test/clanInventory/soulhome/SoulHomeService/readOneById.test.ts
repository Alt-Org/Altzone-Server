import {SoulHomeService} from "../../../../clanInventory/soulhome/soulhome.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import RoomModule from "../../modules/room.module";
import ClanModule from "../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ModelName} from "../../../../common/enum/modelName.enum";

describe('SoulHomeService.readOneById() test suite', () => {
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
        existingSoulHome._id = soulHomeResp._id;

        room1.soulHome_id = existingSoulHome._id;
        room2.soulHome_id = existingSoulHome._id;

        await roomModel.insertMany([room1, room2]);
    });

    it('Should find existing soul home from DB', async () => {
        const [soulHome, errors] = await soulHomeService.readOneById(existingSoulHome._id);

        const clearedSoulHome = clearDBRespDefaultFields(soulHome);

        expect(errors).toBeNull();
        expect(clearedSoulHome).toEqual(expect.objectContaining(existingSoulHome));
    });

    it('Should return fields only requested in "select"', async () => {
        const [soulHome, errors] = await soulHomeService.readOneById(existingSoulHome._id, { select: [ '_id', 'name' ] });

        const clearedSoulHome = clearDBRespDefaultFields(soulHome);
        const expected = { _id: existingSoulHome._id, name: existingSoulHome.name };

        expect(errors).toBeNull();
        expect(clearedSoulHome).toEqual(expected);
    });

    it('Should return NOT_FOUND SError for non-existing soul home', async () => {
        const [soulHome, errors] = await soulHomeService.readOneById(getNonExisting_id());

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION SError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        const [soulHome, errors] = await soulHomeService.readOneById(invalid_id);

        expect(soulHome).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should not throw if provided _id is null or undefined', async () => {
        const null_idCall = async () => await soulHomeService.readOneById(null);
        const undefined_idCall = async () => await soulHomeService.readOneById(undefined);

        expect(null_idCall).not.toThrow();
        expect(undefined_idCall).not.toThrow();
    });

    it('Should return NOT_FOUND if provided _id is null or undefined', async () => {
        const [soulHomeNullCall, errorsNullCall] = await soulHomeService.readOneById(null);
        const [soulHomeUndefinedCall, errorsCall] = await soulHomeService.readOneById(undefined);

        expect(soulHomeNullCall).toBeNull();
        expect(errorsNullCall).toContainSE_NOT_FOUND();

        expect(soulHomeUndefinedCall).toBeNull();
        expect(errorsCall).toContainSE_NOT_FOUND();
    });

    it('Should get soul home\'s collection references if they exists in DB', async () => {
        const [soulHome, errors] = await soulHomeService.readOneById(
            existingSoulHome._id,
            { includeRefs: [ ModelName.ROOM, ModelName.CLAN ] }
        );

        expect(errors).toBeNull();

        const clearedRooms = clearDBRespDefaultFields(soulHome.Room);
        expect(clearedRooms).toMatchObject(clearedRooms);

        const clearedClan = clearDBRespDefaultFields(soulHome.Clan);
        expect(clearedClan).toMatchObject(clearedClan);
    });

    it('Should ignore non-existing schema references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];
        const [clan, errors] = await soulHomeService.readOneById(existingSoulHome._id, { includeRefs: nonExistingReferences });

        expect(errors).toBeNull();
        expect(clan['non-existing']).toBeUndefined();
    });
});