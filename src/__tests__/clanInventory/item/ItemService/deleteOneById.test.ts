import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { ItemService } from '../../../../clanInventory/item/item.service';
import ItemModule from '../../modules/item.module';

describe('ItemService.deleteOneById() test suite', () => {
  let itemService: ItemService;
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();
  const existingItem = itemBuilder.build();

  beforeEach(async () => {
    itemService = await ItemModule.getItemService();
    const createdItem = await itemModel.create(existingItem);
    existingItem._id = createdItem._id;
  });

  it('Should delete the item from DB if the _id is valid and return true', async () => {
    const [wasDeleted, errors] = await itemService.deleteOneById(
      existingItem._id,
    );

    expect(errors).toBeNull();
    expect(wasDeleted).toBeTruthy();

    const deletedItem = await itemModel.findById(existingItem._id);
    expect(deletedItem).toBeNull();
  });

  it('Should return ServiceError NOT_FOUND if the item with provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const [wasDeleted, errors] =
      await itemService.deleteOneById(nonExisting_id);

    expect(wasDeleted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if input _id is null or undefined', async () => {
    const nullInput = async () => await itemService.deleteOneById(null);
    const undefinedInput = async () =>
      await itemService.deleteOneById(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
