import { ItemService } from '../../../../clanInventory/item/item.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import ItemModule from '../../modules/item.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import RoomModule from '../../modules/room.module';

describe('ItemService.deleteAllRoomItems() test suite', () => {
  let itemService: ItemService;
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();
  const existingItem1 = itemBuilder.build();
  const existingItem2 = itemBuilder.build();

  const roomModel = RoomModule.getRoomModel();
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const existingRoom = roomBuilder.setSoulHomeId(getNonExisting_id()).build();

  beforeEach(async () => {
    itemService = await ItemModule.getItemService();

    const createdRoom = await roomModel.create(existingRoom);
    existingRoom._id = createdRoom._id;

    existingItem1.room_id = createdRoom._id as any;
    existingItem2.room_id = createdRoom._id as any;
    const createdItem1 = await itemModel.create(existingItem1);
    existingItem1._id = createdItem1._id;

    const createdItem2 = await itemModel.create(existingItem2);
    existingItem2._id = createdItem2._id;
  });

  it('Should delete all items that are in the specified room from DB and return true', async () => {
    const [wasDeleted, errors] = await itemService.deleteAllRoomItems(
      existingRoom._id,
    );

    expect(errors).toBeNull();
    expect(wasDeleted).toBe(true);

    const deletedItems = await itemModel.find({ room_id: existingRoom._id });
    expect(deletedItems).toHaveLength(0);
  });

  it('Should return ServiceError NOT_FOUND if room with the provided _id does not exists', async () => {
    const [wasDeleted, errors] =
      await itemService.deleteAllRoomItems(getNonExisting_id());

    expect(wasDeleted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if the filter is null or undefined', async () => {
    const nullInput = async () => await itemService.deleteAllRoomItems(null);
    const undefinedInput = async () =>
      await itemService.deleteAllRoomItems(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
