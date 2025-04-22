import { ItemMoverService } from '../../../itemMover/itemMover.service';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import { Rarity } from '../../../clanInventory/item/enum/rarity.enum';
import ItemModule from '../../clanInventory/modules/item.module';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import ItemMoverModule from '../modules/itemMover.module';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';
import RoomModule from '../../clanInventory/modules/room.module';
import StockModule from '../../clanInventory/modules/stock.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MoveTo } from '../../../clanInventory/item/enum/moveTo.enum';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

describe('ItemMoverService.moveItems() test suite', () => {
  let itemMoverService: ItemMoverService;

  const itemModel = ItemModule.getItemModel();
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const item1 = itemBuilder
    .setName(ItemName.ARMCHAIR_RAKKAUS)
    .setRarityLevel(Rarity.common)
    .build();
  const item2 = itemBuilder
    .setName(ItemName.CLOSET_RAKKAUS)
    .setRarityLevel(Rarity.common)
    .build();
  const allItemsFilter = { rarity: Rarity.common };

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder
    .setClanId(getNonExisting_id())
    .build();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom = roomBuilder.build();

  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const existingStock = stockBuilder.setClanId(getNonExisting_id()).build();

  beforeEach(async () => {
    itemMoverService = await ItemMoverModule.getItemMoverService();

    const soulHomeResp = await soulHomeModel.create(existingSoulHome);
    existingSoulHome._id = soulHomeResp._id;
    existingRoom.soulHome_id = existingSoulHome._id;
    const roomResp = await roomModel.create(existingRoom);
    existingRoom._id = roomResp._id;

    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;

    const dbResp1 = await itemModel.create(item1);
    const dbResp2 = await itemModel.create(item2);
    item1._id = dbResp1._id;
    item2._id = dbResp2._id;
  });

  it('Should move the items from room to specified stock', async () => {
    await itemModel.updateMany(allItemsFilter, { room_id: existingRoom._id });

    await itemMoverService.moveItems(
      [item1._id, item2._id],
      existingStock._id,
      MoveTo.STOCK,
    );

    const itemsInDB = await itemModel.find(allItemsFilter);
    const clearedItemsInDB = clearDBRespDefaultFields(itemsInDB);

    expect(clearedItemsInDB).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1,
          stock_id: existingStock._id,
          room_id: null,
        }),
        expect.objectContaining({
          ...item2,
          stock_id: existingStock._id,
          room_id: null,
        }),
      ]),
    );
  });

  //TODO: should return items with updated stock_id field
  it('Should return moved to stock items', async () => {
    await itemModel.updateMany(allItemsFilter, { room_id: existingRoom._id });

    const [items, errors] = await itemMoverService.moveItems(
      [item1._id, item2._id],
      existingStock._id,
      MoveTo.STOCK,
    );

    expect(errors).toBeNull();

    const clearedItems = clearDBRespDefaultFields(items);
    expect(clearedItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1,
          room_id: existingRoom._id,
          stock_id: null,
        }),
        expect.objectContaining({
          ...item2,
          room_id: existingRoom._id,
          stock_id: null,
        }),
      ]),
    );
  });

  it('Should move the items from stock to specified room', async () => {
    await itemModel.updateMany(allItemsFilter, { stock_id: existingStock._id });

    await itemMoverService.moveItems(
      [item1._id, item2._id],
      existingRoom._id,
      MoveTo.ROOM,
    );

    const itemsInDB = await itemModel.find(allItemsFilter);
    const clearedItemsInDB = clearDBRespDefaultFields(itemsInDB);

    expect(clearedItemsInDB).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1,
          room_id: existingRoom._id,
          stock_id: null,
        }),
        expect.objectContaining({
          ...item2,
          room_id: existingRoom._id,
          stock_id: null,
        }),
      ]),
    );
  });

  //TODO: should return items with updated room_id field
  it('Should return moved to room items', async () => {
    await itemModel.updateMany(allItemsFilter, { stock_id: existingStock._id });

    const [items, errors] = await itemMoverService.moveItems(
      [item1._id, item2._id],
      existingRoom._id,
      MoveTo.ROOM,
    );

    expect(errors).toBeNull();

    const clearedItems = clearDBRespDefaultFields(items);
    expect(clearedItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1,
          stock_id: existingStock._id,
          room_id: null,
        }),
        expect.objectContaining({
          ...item2,
          stock_id: existingStock._id,
          room_id: null,
        }),
      ]),
    );
  });

  it('Should return NOT_FOUND if no items are found', async () => {
    const [items, errors] = await itemMoverService.moveItems(
      [getNonExisting_id()],
      existingRoom._id,
      MoveTo.ROOM,
    );

    expect(items).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  //TODO: should validate and return NOT_ALLOWED not NOT_FOUND
  it('Should return NOT_FOUND if provided _ids are not mongo _ids', async () => {
    const [items, errors] = await itemMoverService.moveItems(
      ['non-mongo-id'],
      existingRoom._id,
      MoveTo.ROOM,
    );

    expect(items).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  //TODO: should validate storageId param
  // it('Should return NOT_ALLOWED if provided storageId is not mongo _id', async () => {
  //     const [items, errors] = await itemMoverService.moveItems([item1._id], 'not-mongo-id', MoveTo.ROOM);
  //
  //     expect(items).toBeNull();
  //     expect(errors).toContainSE_NOT_ALLOWED();
  // });

  //TODO: should return NOT_FOUND
  // it('Should return NOT_FOUND if provided stock _id does not exists', async () => {
  //     const [items, errors] = await itemMoverService.moveItems([item1._id], getNonExisting_id(), MoveTo.STOCK);
  //
  //     expect(items).toBeNull();
  //     expect(errors).toContainSE_NOT_FOUND();
  // });

  // TODO: should return NOT_FOUND
  // it('Should return NOT_FOUND if provided room _id does not exists', async () => {
  //     const [items, errors] = await itemMoverService.moveItems([item1._id], getNonExisting_id(), MoveTo.ROOM);
  //
  //     expect(items).toBeNull();
  //     expect(errors).toContainSE_NOT_FOUND();
  // });
});
