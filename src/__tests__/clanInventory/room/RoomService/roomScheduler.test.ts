import { RoomService } from "../../../../clanInventory/room/room.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import RoomModule from "../../modules/room.module";
import { getNonExisting_id } from "../../../../__tests__/test_utils/util/getNonExisting_id";
import ClanBuilderFactory from "../../../../__tests__/clan/data/clanBuilderFactory";
import ClanModule from "../../../../__tests__/clan/modules/clan.module";
import SoulhomeModule from "../../modules/soulhome.module";
import StockModule from "../../modules/stock.module";
import ItemModule from "../../modules/item.module";
import { ItemService } from "../../../../clanInventory/item/item.service";
import { ClanService } from "../../../../clan/clan.service";
import { RoomScheduler } from "../../../../clanInventory/room/room.scheduler";
import { RoomStatus } from "../../../../clanInventory/room/enum/roomStatus.enum";

describe('Room.roomScheduler() test suite', () => {
  let roomService: RoomService;
  let itemService: ItemService;
  let clanService: ClanService
  let roomScheduler: RoomScheduler

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setId(getNonExisting_id()).build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder.setId(getNonExisting_id()).setClanId(existingClan._id).build();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom = roomBuilder.setId(getNonExisting_id()).setSoulHomeId(existingSoulHome._id).build();

  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const existingStock = stockBuilder.setId(getNonExisting_id()).setClanId(existingClan._id).build();

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
  const itemModel = ItemModule.getItemModel();

  beforeEach(async () => {
    roomService = await RoomModule.getRoomService();
    itemService = await ItemModule.getItemService();
    clanService = await ClanModule.getClanService();
    roomScheduler = await RoomModule.getRoomScheduler();

    await clanModel.create(existingClan);
    await soulHomeModel.create(existingSoulHome);
    await stockModel.create(existingStock);
  });

  it('should delete inactive rooms past the grace period', async () => {
    existingRoom.roomStatus = RoomStatus.INACTIVE;
    existingRoom.deactivationTime = new Date(Date.now() - 48 * 60 * 60 * 1000);

    await roomModel.create(existingRoom);

    await roomScheduler.removeInactiveRooms();

    const room = await roomModel.findById(existingRoom._id);
    expect(room).toBeNull();
  });

  it('should not delete inactive rooms inside grace period', async () => {
    existingRoom.roomStatus = RoomStatus.INACTIVE;
    existingRoom.deactivationTime = new Date();

    await roomModel.create(existingRoom);

    await roomScheduler.removeInactiveRooms();

    const room = await roomModel.findById(existingRoom._id);
    expect(room).not.toBeNull();
  });

  it('should ignore active rooms', async () => {
    existingRoom.roomStatus = RoomStatus.ACTIVE;

    await roomModel.create(existingRoom);

    await roomScheduler.removeInactiveRooms();

    const room = await roomModel.findById(existingRoom._id);
    expect(room).not.toBeNull();
  });

  it('should move room items into clan stock', async () => {
    existingRoom.roomStatus = RoomStatus.INACTIVE;
    existingRoom.deactivationTime = new Date(Date.now() - 48 * 60 * 60 * 1000);

    await roomModel.create(existingRoom);

    const existingItem1 = itemBuilder.setRoomId(existingRoom._id).build();
    const existingItem2 = itemBuilder.setRoomId(existingRoom._id).build();

    await itemModel.create(existingItem1);
    await itemModel.create(existingItem2);

    await roomScheduler.removeInactiveRooms();

    const [items,] = await itemService.readMany()
    expect(items[0].room_id).toBeNull();
    expect(items[1].room_id).toBeNull();
    expect(items[0].stock_id.toString()).toBe(existingStock._id.toString());
    expect(items[1].stock_id.toString()).toBe(existingStock._id.toString());
  });
});
