import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";
import {RoomService} from "../../../../clanInventory/room/room.service";
import RoomModule from "../../modules/room.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('RoomService.createOne() test suite', () => {
    let roomService: RoomService;
    const roomCreateBuilder = ClanInventoryBuilderFactory.getBuilder('CreateRoomDto');
    const roomModel = RoomModule.getRoomModel();

    const soulHome_id = getNonExisting_id();
    const roomToCreate = roomCreateBuilder.setSoulHomeId(soulHome_id).build();

    beforeEach(async () => {
        roomService = await RoomModule.getRoomService();
    });

    it('Should save room data to DB if input is valid', async () => {
        await roomService.createOne(roomToCreate);

        const dbResp = await roomModel.find({ soulHome_id: soulHome_id });
        const clanInDB = dbResp[0]?.toObject();

        const clearedResp = clearDBRespDefaultFields(clanInDB);

        expect(dbResp).toHaveLength(1);
        expect(clearedResp).toEqual(expect.objectContaining({...roomToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should return saved room data, if input is valid', async () => {
        const [result, errors] = await roomService.createOne(roomToCreate);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({...roomToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should not save any data in DB, if the provided cellCount is null', async () => {
        const invalidRoom = {...roomToCreate, cellCount: null} as any;
        await roomService.createOne(invalidRoom);

        const dbResp = await roomModel.findOne({ soulHome_id: soulHome_id });

        expect(dbResp).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED, if the provided cellCount is null', async () => {
        const invalidRoom = {...roomToCreate, cellCount: null} as any;
        const [result, errors] = await roomService.createOne(invalidRoom);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await roomService.createOne(null);
        const undefinedInput = async () => await roomService.createOne(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});