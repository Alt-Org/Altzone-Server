import { ItemRotation } from 'src/clanInventory/item/enum/itemRotation.enum';
import { itemProperties } from '../../../clanInventory/item/const/itemProperties';
import { CreateItemDto } from '../../../clanInventory/item/dto/createItem.dto';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import { ItemPosition } from 'src/clanInventory/item/enum/itemPosition.enum';

/**
 * Returns default Item objects for a Stock
 *
 * @param stock_id Stock _id to which the returning Items belong to
 * @returns An array of default Items for a Stock
 */
export function getStockDefaultItems(stock_id: string): CreateItemDto[] {
  return [
    {
      ...itemProperties.Carpet_Rakkaus,
      stock_id,
      room_id: null,
      unityKey: ItemName.CARPET_RAKKAUS,
      location: [-1, -1],
      furnitureSize: null,
      rotation: null,
      position: null,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.Mirror_Rakkaus,
      stock_id,
      room_id: null,
      unityKey: ItemName.MIRROR_RAKKAUS,
      location: [-1, -1],
      furnitureSize: null,
      rotation: null,
      position: null,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.Closet_Rakkaus,
      stock_id,
      room_id: null,
      unityKey: ItemName.CLOSET_RAKKAUS,
      location: [-1, -1],
      furnitureSize: null,
      rotation: null,
      position: null,
      placedOn_id: null,
      placedOnLocation: null
    },
  ];
}

/**
 * Returns default Item objects for a SoulHome's Room
 *
 * @param room_id Room _id to which the returning Items belong to
 * @returns An array of default Items for a Room
 */
export function getRoomDefaultItems(room_id: string): CreateItemDto[] {
  return [
    {
      ...itemProperties.Sofa_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.SOFA_RAKKAUS,
      location: [1, 1],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.ArmChair_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.ARMCHAIR_RAKKAUS,
      location: [1, 2],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.Lamp_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.LAMP_RAKKAUS,
      location: [1, 3],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.Diningtable_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.DININGTABLE_RAKKAUS,
      location: [1, 4],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.SofaTable_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.SOFATABLE_RAKKAUS,
      location: [1, 5],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
    {
      ...itemProperties.Bed_Rakkaus,
      stock_id: null,
      room_id,
      unityKey: ItemName.BED_RAKKAUS,
      location: [1, 6],
      furnitureSize: null,
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null
    },
  ];
}
