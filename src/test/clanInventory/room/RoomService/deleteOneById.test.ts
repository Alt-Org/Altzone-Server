import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import RoomModule from "../../modules/room.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {RoomService} from "../../../../clanInventory/room/room.service";


describe('Room.deleteOneById() test suite', () => {
    let roomService: RoomService;
    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.setSoulHomeId(getNonExisting_id()).build();

    beforeEach(async () => {
        roomService = await RoomModule.getRoomService();
        const createdRoom = await roomModel.create(existingRoom);
        existingRoom._id = createdRoom._id;
    });

    it('Should delete the room from DB if the _id is valid and return true', async () => {
        const [wasDeleted, errors] = await roomService.deleteOneById(existingRoom._id);

        expect(errors).toBeNull();
        expect(wasDeleted).toBeTruthy();

        const deletedRoom = await roomModel.findById(existingRoom._id);
        expect(deletedRoom).toBeNull();
    });

    it('Should return ServiceError NOT_FOUND if the room with provided _id does not exist', async () => {
        const nonExisting_id = getNonExisting_id();
        const [wasDeleted, errors] = await roomService.deleteOneById(nonExisting_id);

        expect(wasDeleted).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input _id is null or undefined', async () => {
        const nullInput = async () => await roomService.deleteOneById(null);
        const undefinedInput = async () => await roomService.deleteOneById(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});