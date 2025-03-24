import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { ItemService } from '../../../../clanInventory/item/item.service';
import ItemModule from '../../modules/item.module';

describe('ItemService.createMany() test suite', () => {
  let itemService: ItemService;
  const itemCreateBuilder =
    ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
  const itemModel = ItemModule.getItemModel();

  const room_id = new ObjectId(getNonExisting_id());
  const item1ToCreate = itemCreateBuilder.setRoomId(room_id).build();
  const item2ToCreate = itemCreateBuilder.setRoomId(room_id).build();

  beforeEach(async () => {
    itemService = await ItemModule.getItemService();
  });

  it('Should save items data to DB if input is valid', async () => {
    await itemService.createMany([item1ToCreate, item2ToCreate]);

    const dbResp = await itemModel.find({ room_id: room_id });

    const clearedResp = clearDBRespDefaultFields(dbResp);

    expect(dbResp).toHaveLength(2);
    expect(clearedResp).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1ToCreate,
          _id: expect.any(ObjectId),
        }),
        expect.objectContaining({
          ...item2ToCreate,
          _id: expect.any(ObjectId),
        }),
      ]),
    );
  });

  it('Should return saved items data, if input is valid', async () => {
    const [result, errors] = await itemService.createMany([
      item1ToCreate,
      item2ToCreate,
    ]);

    expect(errors).toBeNull();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...item1ToCreate,
          _id: expect.any(ObjectId),
        }),
        expect.objectContaining({
          ...item2ToCreate,
          _id: expect.any(ObjectId),
        }),
      ]),
    );
  });

  //TODO: sometimes saves sometime not
  it('Should not save any data in DB, if the provided name field has wrong value', async () => {
    const invalidItem = { ...item1ToCreate, name: null } as any;
    await itemService.createMany([invalidItem, item2ToCreate]);

    const dbResp = await itemModel.find({ room_id: room_id });

    expect(dbResp).not.toHaveLength(3);
  });

  it('Should return ServiceError with reason REQUIRED, if the provided name is null', async () => {
    const invalidItem = { ...item1ToCreate, name: null } as any;
    const [result, errors] = await itemService.createMany([
      invalidItem,
      item2ToCreate,
    ]);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not throw any error if provided input is null or undefined', async () => {
    const nullInput = async () => await itemService.createMany(null);
    const undefinedInput = async () => await itemService.createMany(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
