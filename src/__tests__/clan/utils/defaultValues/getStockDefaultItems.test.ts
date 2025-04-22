import { itemProperties } from '../../../../clanInventory/item/const/itemProperties';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { getStockDefaultItems } from '../../../../clan/utils/defaultValues/items';

describe('getStockDefaultItems() test suite', () => {
  it('Should return valid stock default items', () => {
    const stock_id = '';
    const expected = [
      {
        ...itemProperties.Carpet_Rakkaus,
        stock_id,
        room_id: null,
        unityKey: ItemName.CARPET_RAKKAUS,
        location: [-1, -1],
      },
      {
        ...itemProperties.Mirror_Rakkaus,
        stock_id,
        room_id: null,
        unityKey: ItemName.MIRROR_RAKKAUS,
        location: [-1, -1],
      },
      {
        ...itemProperties.Closet_Rakkaus,
        stock_id,
        room_id: null,
        unityKey: ItemName.CLOSET_RAKKAUS,
        location: [-1, -1],
      },
    ];

    expect(getStockDefaultItems(stock_id)).toEqual(
      expect.arrayContaining(expected),
    );
  });
});
