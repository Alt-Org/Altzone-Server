import { ItemName } from '../enum/itemName.enum';
import { QualityLevel } from '../enum/qualityLevel.enum';
import { Recycling } from '../enum/recycling.enum';

/**
 * Default properties of an Item
 */
export type ItemProperty = {
  name: ItemName;
  weight: number;
  price: number;
  qualityLevel: QualityLevel;
  recycling: Recycling;
  isFurniture: boolean;
};

/**
 * Record of all defined Item properties
 */
export const itemProperties: Record<ItemName, ItemProperty> = {
  //Sofas
  [ItemName.SOFA_TAAKKA]: {
    name: ItemName.SOFA_TAAKKA,
    weight: 30,
    price: 150,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },
  [ItemName.SOFA_RAKKAUS]: {
    name: ItemName.SOFA_RAKKAUS,
    weight: 27,
    price: 130,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },

  //Chairs
  [ItemName.ARMCHAIR_TAAKKA]: {
    name: ItemName.ARMCHAIR_TAAKKA,
    weight: 16,
    price: 120,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },
  [ItemName.ARMCHAIR_RAKKAUS]: {
    name: ItemName.ARMCHAIR_RAKKAUS,
    weight: 13,
    price: 100,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },
  [ItemName.CHAIR_NEURO]: {
    name: ItemName.CHAIR_NEURO,
    weight: 10,
    price: 170,
    qualityLevel: QualityLevel.epic,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },
  [ItemName.STOOL_NEURO]: {
    name: ItemName.STOOL_NEURO,
    weight: 4,
    price: 40,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },

  //Lamp
  [ItemName.FLOORLAMP_TAAKKA]: {
    name: ItemName.FLOORLAMP_TAAKKA,
    weight: 2.8,
    price: 240,
    qualityLevel: QualityLevel.epic,
    recycling: Recycling.ELECTRICAL_EQUIPMENT,
    isFurniture: false,
  },
  [ItemName.FLOORLAMP_RAKKAUS]: {
    name: ItemName.FLOORLAMP_TAAKKA,
    weight: 2,
    price: 200,
    qualityLevel: QualityLevel.epic,
    recycling: Recycling.GLASS,
    isFurniture: false,
  },

  //Tables
  [ItemName.SOFATABLE_TAAKKA]: {
    name: ItemName.SOFATABLE_TAAKKA,
    weight: 26,
    price: 80,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },
  [ItemName.DININGTABLE_RAKKAUS]: {
    name: ItemName.DININGTABLE_RAKKAUS,
    weight: 30,
    price: 100,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },
  [ItemName.SOFATABLE_RAKKAUS]: {
    name: ItemName.SOFATABLE_RAKKAUS,
    weight: 20,
    price: 60,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },

  //Beds
  [ItemName.BED_RAKKAUS]: {
    name: ItemName.BED_RAKKAUS,
    weight: 20,
    price: 200,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: true,
  },

  //Carpets
  [ItemName.CARPET_SCHRODINGER]: {
    name: ItemName.CARPET_SCHRODINGER,
    weight: 6,
    price: 150,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: false,
  },
  [ItemName.CARPET_RAKKAUS]: {
    name: ItemName.CARPET_RAKKAUS,
    weight: 6,
    price: 100,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.MIXED_WASTE,
    isFurniture: false,
  },

  //Mirrors
  [ItemName.MIRROR_SCHRODINGER]: {
    name: ItemName.MIRROR_SCHRODINGER,
    weight: 7,
    price: 150,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.GLASS,
    isFurniture: false,
  },
  [ItemName.MIRROR_RAKKAUS]: {
    name: ItemName.MIRROR_RAKKAUS,
    weight: 10,
    price: 170,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.GLASS,
    isFurniture: false,
  },
  [ItemName.MIRROR_TAAKKA]: {
    name: ItemName.MIRROR_TAAKKA,
    weight: 8,
    price: 100,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.GLASS,
    isFurniture: false,
  },

  //WC
  [ItemName.TOILET_SCHRODINGER]: {
    name: ItemName.TOILET_SCHRODINGER,
    weight: 31,
    price: 150,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.LANDFILL,
    isFurniture: false,
  },

  //Washing
  [ItemName.SINK_SCHRODINGER]: {
    name: ItemName.SINK_SCHRODINGER,
    weight: 13,
    price: 150,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.LANDFILL,
    isFurniture: false,
  },

  //Closets
  [ItemName.CLOSET_TAAKKA]: {
    name: ItemName.CLOSET_TAAKKA,
    weight: 48,
    price: 120,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },
  [ItemName.CLOSET_RAKKAUS]: {
    name: ItemName.CLOSET_RAKKAUS,
    weight: 45,
    price: 130,
    qualityLevel: QualityLevel.common,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },
  [ItemName.DRESSER_NEURO]: {
    name: ItemName.DRESSER_NEURO,
    weight: 24,
    price: 100,
    qualityLevel: QualityLevel.rare,
    recycling: Recycling.WOOD,
    isFurniture: true,
  },
};
