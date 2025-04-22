import { itemProperties } from '../../../../clanInventory/item/const/itemProperties';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { getRoomDefaultItems } from '../../../../clan/utils/defaultValues/items';

describe('getRoomDefaultItems() test suite', () => {
  it('Should return valid room default items', () => {
    const room_id = '';
    const expected = [
      {
        ...itemProperties.Sofa_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.SOFA_RAKKAUS,
        location: [1, 1],
      },
      {
        ...itemProperties.ArmChair_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.ARMCHAIR_RAKKAUS,
        location: [1, 2],
      },
      {
        ...itemProperties.Floorlamp_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.FLOORLAMP_RAKKAUS,
        location: [1, 3],
      },
      {
        ...itemProperties.Diningtable_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.DININGTABLE_RAKKAUS,
        location: [1, 4],
      },
      {
        ...itemProperties.SofaTable_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.SOFATABLE_RAKKAUS,
        location: [1, 5],
      },
      {
        ...itemProperties.Bed_Rakkaus,
        stock_id: null,
        room_id,
        unityKey: ItemName.BED_RAKKAUS,
        location: [1, 6],
      },
    ];

    expect(getRoomDefaultItems(room_id)).toEqual(
      expect.arrayContaining(expected),
    );
  });
});
