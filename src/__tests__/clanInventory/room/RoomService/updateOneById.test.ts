import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {RoomService} from "../../../../clanInventory/room/room.service";
import RoomModule from "../../modules/room.module";


describe('RoomService.updateOneById() test suite', () => {
    let roomService: RoomService;
    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomUpdateBuilder = ClanInventoryBuilderFactory.getBuilder('UpdateRoomDto');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.setSoulHomeId(getNonExisting_id()).build();

    beforeEach(async () => {
        roomService = await RoomModule.getRoomService();
        const createdRoom = await roomModel.create(existingRoom);
        existingRoom._id = createdRoom._id;
    });

    it('Should update room in the DB and return true if the input is valid', async () => {
        const updatedCellCount = 20;
        const updateData = roomUpdateBuilder.setId(existingRoom._id).setCellCount(updatedCellCount).build();

        const [wasUpdated, errors] = await roomService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedSoulHome = await roomModel.findById(existingRoom._id);
        expect(updatedSoulHome.cellCount).toBe(updatedCellCount);
    });

    it('Should return ServiceError NOT_FOUND if the room with provided _id does not exist', async () => {
        const updatedCellCount = 20;
        const updateData = roomUpdateBuilder.setId(getNonExisting_id()).setCellCount(updatedCellCount).build();

        const [wasUpdated, errors] = await roomService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: Should not throw
    it('Should throw error if input is null or undefined', async () => {
        const nullInput = async () => await roomService.updateOneById(null);
        const undefinedInput = async () => await roomService.updateOneById(undefined);

        await expect(nullInput).rejects.toThrow();
        await expect(undefinedInput).rejects.toThrow();
    });
});