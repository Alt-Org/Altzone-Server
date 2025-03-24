import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import ItemModule from '../../modules/item.module';
import StockModule from '../../modules/stock.module';
import SoulhomeModule from '../../modules/soulhome.module';
import RoomModule from '../../modules/room.module';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { ItemHelperService } from '../../../../clanInventory/item/itemHelper.service';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('ItemHelperService.getItemClanId() test suite', () => {
  let itemHelperService: ItemHelperService;
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();

  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingClan = clanBuilder.build();

  beforeEach(async () => {
    itemHelperService = await ItemModule.getItemHelperService();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
  });

  it('Should find clan _id of the item in stock', async () => {
    const stockToCreate = stockBuilder.setClanId(existingClan._id).build();
    const createdStock = await stockModel.create(stockToCreate);

    const itemToCreate = itemBuilder.setStockId(createdStock._id).build();
    const createdItem = await itemModel.create(itemToCreate);

    const [clan_id, errors] = await itemHelperService.getItemClanId(
      createdItem._id,
    );

    expect(errors).toBeNull();
    expect(clan_id).toBe(existingClan._id.toString());
  });

  it('Should find clan _id of the item in soul home room', async () => {
    const soulHomeToCreate = soulHomeBuilder
      .setClanId(existingClan._id)
      .build();
    const createdSoulHome = await soulHomeModel.create(soulHomeToCreate);

    const roomToCreate = roomBuilder.setSoulHomeId(createdSoulHome._id).build();
    const createdRoom = await roomModel.create(roomToCreate);

    const itemToCreate = itemBuilder.setRoomId(createdRoom._id).build();
    const createdItem = await itemModel.create(itemToCreate);

    const [clan_id, errors] = await itemHelperService.getItemClanId(
      createdItem._id,
    );

    expect(errors).toBeNull();
    expect(clan_id).toBe(existingClan._id.toString());
  });

  it('Should return NOT_FOUND SE if item is not in any stock or soul home room', async () => {
    const itemToCreate = itemBuilder.build();
    const createdItem = await itemModel.create(itemToCreate);

    const [clan_id, errors] = await itemHelperService.getItemClanId(
      createdItem._id,
    );

    expect(clan_id).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND SE if item with provided item does not exists', async () => {
    const [clan_id, errors] =
      await itemHelperService.getItemClanId(getNonExisting_id());

    expect(clan_id).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  //TODO: should return VALIDATION not NOT_FOUND
  it('Should return VALIDATION SE if provided _id param is not a mongo id', async () => {
    const [clan_id, errors] =
      await itemHelperService.getItemClanId('not-mongo-id');

    expect(clan_id).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
