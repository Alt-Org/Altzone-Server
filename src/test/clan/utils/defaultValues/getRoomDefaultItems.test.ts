import {itemProperties} from "../../../../clanInventory/item/const/itemProperties";
import {ItemName} from "../../../../clanInventory/item/enum/itemName.enum";
import {getRoomDefaultItems} from "../../../../clan/utils/defaultValues/items";

describe('getRoomDefaultItems() test suite', () => {
    it('Should return valid room default items', () => {
        const room_id = '';
        const expected = [
            {...itemProperties.Sofa_Rakkaus, stock_id: null, room_id, unityKey: ItemName.SOFA_RAKKAUS, location : [1,1] },
            {...itemProperties.Carpet_Rakkaus, stock_id: null, room_id, unityKey: ItemName.CARPET_RAKKAUS, location : [1,2] },
            {...itemProperties.Chair_Neuro, stock_id: null, room_id, unityKey: ItemName.CHAIR_NEURO, location : [1,3] },
            {...itemProperties.SideTable_Taakka, stock_id: null, room_id, unityKey: ItemName.SIDETABLE_TAAKKA, location : [1,4] },
            {...itemProperties.Floorlamp_Taakka, stock_id: null, room_id, unityKey: ItemName.FLOORLAMP_TAAKKA, location : [1,5] },
            {...itemProperties.Sofa_Taakka, stock_id: null, room_id, unityKey: ItemName.SOFA_TAAKKA, location : [1,6] }
        ];

        expect(getRoomDefaultItems(room_id)).toEqual(expect.arrayContaining(expected));
    });
});