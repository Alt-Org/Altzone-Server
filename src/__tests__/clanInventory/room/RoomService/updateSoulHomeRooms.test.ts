import { RoomService } from '../../../../clanInventory/room/room.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import RoomModule from '../../modules/room.module';
import { getNonExisting_id } from '../../../../__tests__/test_utils/util/getNonExisting_id';
import { UpdateRoomDto } from '../../../../clanInventory/room/dto/updateRoom.dto';
import ClanBuilderFactory from '../../../../__tests__/clan/data/clanBuilderFactory';
import ClanModule from '../../../../__tests__/clan/modules/clan.module';
import SoulhomeModule from '../../modules/soulhome.module';
import StockModule from '../../modules/stock.module';
import ItemModule from '../../modules/item.module';
import { ItemService } from '../../../../clanInventory/item/item.service';
import { UpdateItemDto } from '../../../../clanInventory/item/dto/updateItem.dto';
import { ItemRotation } from '../../../../clanInventory/item/enum/itemRotation.enum';
import { ItemPosition } from '../../../../clanInventory/item/enum/itemPosition.enum';
import { ClanService } from '../../../../clan/clan.service';

describe('Room.updateSoulHomeRooms() test suite', () => {
  let roomService: RoomService;
  let itemService: ItemService;
  let clanService: ClanService;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setId(getNonExisting_id()).build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder
    .setId(getNonExisting_id())
    .setClanId(existingClan._id)
    .build();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom = roomBuilder
    .setId(getNonExisting_id())
    .setSoulHomeId(existingSoulHome._id)
    .build();

  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const existingStock = stockBuilder
    .setId(getNonExisting_id())
    .setClanId(existingClan._id)
    .build();

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
  const itemModel = ItemModule.getItemModel();
  const existingItem = itemBuilder.setStockId(existingStock._id).build();

  const update: UpdateRoomDto = {
    _id: existingRoom._id,
    roomColour: 'blue',
    floorType: 'wood',
    wallpaper: 'default',
    furniture: [],
  };

  beforeEach(async () => {
    roomService = await RoomModule.getRoomService();
    itemService = await ItemModule.getItemService();
    clanService = await ClanModule.getClanService();

    await clanModel.create(existingClan);
    await soulHomeModel.create(existingSoulHome);
    await roomModel.create(existingRoom);
    await stockModel.create(existingStock);
    await itemModel.create(existingItem);
  });

  it('Should update values of a Room successfully', async () => {
    const [result, error] = await roomService.updateSoulHomeRooms(update);

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [room, roomErrors] = await roomService.readOneById(existingRoom._id);

    expect(roomErrors).toBeNull();
    expect(room.roomColour).toEqual(update.roomColour);
    expect(room.floorType).toEqual(update.floorType);
  });

  it('Should update Room values successfully when furniture is omitted from the payload', async () => {
    const updateWithoutFurniture: UpdateRoomDto = {
      _id: existingRoom._id,
      roomColour: 'red',
      floorType: 'stone',
      wallpaper: 'painted',
    };

    const [result, error] = await roomService.updateSoulHomeRooms(
      updateWithoutFurniture,
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [room, roomErrors] = await roomService.readOneById(existingRoom._id);

    expect(roomErrors).toBeNull();
    expect(room.roomColour).toEqual(updateWithoutFurniture.roomColour);
    expect(room.floorType).toEqual(updateWithoutFurniture.floorType);
  });

  it('Should update Room furniture successfully and update value in Clan', async () => {
    const [item] = await itemService.createOne(existingItem);

    const itemUpdate: UpdateItemDto = {
      _id: item._id,
      location: [1, 1],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    };

    update.furniture = [itemUpdate];
    const [result, error] = await roomService.updateSoulHomeRooms(update);
    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [items, itemsErrors] = await itemService.readMany({
      filter: { room_id: existingRoom._id },
    });
    expect(itemsErrors).toBeNull();
    expect(items[0].room_id.toString()).toBe(existingRoom._id.toString());
    expect(items[0].stock_id).toBeNull();

    const [clan] = await clanService.readOneById(existingClan._id);
    expect(clan.furnitureTotalValue).toEqual(existingItem.price);
  });
});
