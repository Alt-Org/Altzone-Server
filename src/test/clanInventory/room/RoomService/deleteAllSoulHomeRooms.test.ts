import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import RoomModule from "../../modules/room.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {RoomService} from "../../../../clanInventory/room/room.service";
import ItemModule from "../../modules/item.module";

describe('Room.deleteAllSoulHomeRooms() test suite', () => {
    let roomService: RoomService;
    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom1 = roomBuilder.build();
    const existingRoom2 = roomBuilder.build();

    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemModel = ItemModule.getItemModel();
    const existingItem1 = itemBuilder.build();
    const existingItem2 = itemBuilder.build();

    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId(getNonExisting_id()).build();

    beforeEach(async () => {
        const createdSoulHome = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = createdSoulHome._id;

        roomService = await RoomModule.getRoomService();
        existingRoom1.soulHome_id = existingSoulHome._id.toString();
        const createdRoom1 = await roomModel.create(existingRoom1);
        existingRoom1._id = createdRoom1._id;
        existingRoom2.soulHome_id = existingSoulHome._id.toString();
        const createdRoom2 = await roomModel.create(existingRoom2);
        existingRoom2._id = createdRoom2._id;

        existingItem1.room_id = existingRoom1._id as any;
        existingItem2.room_id = existingRoom1._id as any;
        await itemModel.create(existingItem1);
        await itemModel.create(existingItem2);
    });

    it('Should delete all soul home rooms from DB and return true', async () => {
        const [isRemoved, errors] = await roomService.deleteAllSoulHomeRooms(existingSoulHome._id);

        const roomsInDB = await roomModel.find({soulHome_id: existingSoulHome._id});

        expect(roomsInDB).toHaveLength(0);

        expect(errors).toBeNull();
        expect(isRemoved).toBeTruthy();
    });

    it('Should return NOT_FOUND if soul home does not exists', async () => {
        const [isRemoved, errors] = await roomService.deleteAllSoulHomeRooms(getNonExisting_id());

        expect(isRemoved).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should remove all items of the soul home rooms', async () => {
        await roomService.deleteAllSoulHomeRooms(existingSoulHome._id);

        const itemsInDB = await itemModel.find({room_id: existingRoom1._id});

        expect(itemsInDB).toHaveLength(0);
    });
});