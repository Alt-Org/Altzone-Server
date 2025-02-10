import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import RoomModule from "../../modules/room.module";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ModelName} from "../../../../common/enum/modelName.enum";
import {RoomService} from "../../../../clanInventory/room/room.service";

describe('Room.readOneById() test suite', () => {
    let roomService: RoomService;
    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.build();

    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId(getNonExisting_id()).build();

    beforeEach(async () => {
        const createdSoulHome = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = createdSoulHome._id;

        roomService = await RoomModule.getRoomService();
        existingRoom.soulHome_id = existingSoulHome._id.toString();
        const createdRoom = await roomModel.create(existingRoom);
        existingRoom._id = createdRoom._id;
    });

    it('Should find existing room from DB', async () => {
        const [room, errors] = await roomService.readOneById(existingRoom._id);

        const clearedRoom = clearDBRespDefaultFields(room);

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expect.objectContaining(existingRoom));
    });

    it('Should return fields only requested in "select"', async () => {
        const [room, errors] = await roomService.readOneById(existingRoom._id, { select: [ '_id', 'cellCount' ] });

        const clearedRoom = clearDBRespDefaultFields(room);
        const expected = { _id: existingRoom._id, cellCount: existingRoom.cellCount, isActive: false };

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expected);
    });

    it('Should return NOT_FOUND SError for non-existing room', async () => {
        const [room, errors] = await roomService.readOneById(getNonExisting_id());

        expect(room).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION SError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        const [room, errors] = await roomService.readOneById(invalid_id);

        expect(room).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should not throw if provided _id is null or undefined', async () => {
        const null_idCall = async () => await roomService.readOneById(null);
        const undefined_idCall = async () => await roomService.readOneById(undefined);

        expect(null_idCall).not.toThrow();
        expect(undefined_idCall).not.toThrow();
    });

    it('Should return NOT_FOUND if provided _id is null or undefined', async () => {
        const [roomNullCall, errorsNullCall] = await roomService.readOneById(null);
        const [roomUndefinedCall, errorsCall] = await roomService.readOneById(undefined);

        expect(roomNullCall).toBeNull();
        expect(errorsNullCall).toContainSE_NOT_FOUND();

        expect(roomUndefinedCall).toBeNull();
        expect(errorsCall).toContainSE_NOT_FOUND();
    });

    it('Should get room\'s collection references if they exists in DB', async () => {
        const [room, errors] = await roomService.readOneById(
            existingRoom._id,
            { includeRefs: [ ModelName.SOULHOME ] }
        );

        expect(errors).toBeNull();

        const clearedSoulHome = clearDBRespDefaultFields(room['SoulHome']);
        expect(clearedSoulHome).toMatchObject(existingSoulHome);
    });

    it('Should ignore non-existing schema references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];
        const [room, errors] = await roomService.readOneById(existingRoom._id, { includeRefs: nonExistingReferences });

        expect(errors).toBeNull();
        expect(room['non-existing']).toBeUndefined();
    });
});