import { itemProperties } from "../../../item/const/itemProperties";
import {CreateItemDto} from "../../../item/dto/createItem.dto";
import { ItemName } from "../../../item/enum/itemName.enum";

/**
 * Returns default Item objects for a Stock
 *
 * @param stock_id Stock _id to which the returning Items belongs to
 * @returns An array of default Items for a Stock
 */
export function getStockDefaultItems(stock_id: string): CreateItemDto[]{
    return [
        {...itemProperties.Carpet_Rakkaus, stock_id, room_id: null, unityKey: ItemName.CARPET_RAKKAUS, location : [1,1] },
        {...itemProperties.Mirror_Rakkaus, stock_id, room_id: null, unityKey: ItemName.MIRROR_RAKKAUS, location : [1,2] },
        {...itemProperties.Closet_Rakkaus, stock_id, room_id: null, unityKey: ItemName.CLOSET_RAKKAUS, location : [1,3] }
    ];
}

/**
 * Returns default Item objects for a SoulHome's Room
 *
 * @param room_id Room _id to which the returning Items belongs to
 * @returns An array of default Items for a Room
 */
export function getRoomDefaultItems(room_id: string): CreateItemDto[]{
    return [
        {...itemProperties.Sofa_Rakkaus, stock_id: null, room_id, unityKey: ItemName.SOFA_RAKKAUS, location : [1,1] },
        {...itemProperties.Carpet_Rakkaus, stock_id: null, room_id, unityKey: ItemName.CARPET_RAKKAUS, location : [1,2] },
        {...itemProperties.Chair_Neuro, stock_id: null, room_id, unityKey: ItemName.CHAIR_NEURO, location : [1,3] },
        {...itemProperties.SideTable_Taakka, stock_id: null, room_id, unityKey: ItemName.SIDETABLE_TAAKKA, location : [1,4] },
        {...itemProperties.Floorlamp_Taakka, stock_id: null, room_id, unityKey: ItemName.FLOORLAMP_TAAKKA, location : [1,5] },
        {...itemProperties.Sofa_Taakka, stock_id: null, room_id, unityKey: ItemName.SOFA_TAAKKA, location : [1,6] }
    ];
}