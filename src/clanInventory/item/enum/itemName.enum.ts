/**
 * Enum of Item defined Item names.
 *
 * The underscore after item determines the category the item belongs to
 *
 */
export enum ItemName {
  // Category: Taakka
  SOFA_TAAKKA = 'Sofa_Taakka',
  ARMCHAIR_TAAKKA = 'Armchair_Taakka',
  MIRROR_TAAKKA = 'Mirror_Taakka',
  FLOORLAMP_TAAKKA = 'Floorlamp_Taakka',
  COFFEETABLE_Taakka = 'Coffeetable_Taakka',
  SIDETABLE_TAAKKA = 'Sidetable_Taakka',
  CLOSET_TAAKKA = 'Closet_Taakka',

  // Category: Schrodinger
  SINK_SCHRODINGER = 'Sink_Schrodinger',
  TOILET_SCHRODINGER = 'Toilet_Schrodinger',
  MIRROR_SCHRODINGER = 'Mirror_Schrodinger',
  CARPET_SCHRODINGER = 'Carpet_Schrodinger',
  BATHTUB_SCHRODINGER = 'Bathtub_Schrodinger',

  // Category: Rakkaus
  SOFA_RAKKAUS = 'Sofa_Rakkaus',
  ARMCHAIR_RAKKAUS = 'Armchair_Rakkaus',
  CLOSET_RAKKAUS = 'Closet_Rakkaus',
  CARPET_RAKKAUS = 'Carpet_Rakkaus',
  COFFEETABLE_RAKKAUS = 'Coffeetable_Rakkaus',
  DININGTABLE_RAKKAUS = 'Diningtable_Rakkaus',
  BED_RAKKAUS = 'Bed_Rakkaus',
  MIRROR_RAKKAUS = 'Mirror_Rakkaus',
  CEILINGLAMP_RAKKAUS = 'Ceilinglamp_Rakkaus',

  // Category: Neuro
  CHAIR_NEURO = 'Chair_Neuro',
  DRESSER_NEURO = 'Dresser_Neuro',
  STOOL_NEURO = 'Stool_Neuro',
  CLOCK_NEURO = 'Clock_Neuro',

  // Category: Polarity
  CHAIR_POLARITY = 'Chair_Polarity',
  BOOKSHELF_POLARITY = 'Bookshelf_Polarity',
  TABLE_POLARITY = 'Table_Polarity',

  // Category: Muistoja
  COMMODE_MUISTOJA = 'Commode_Muistoja',
  PICTURES_MUISTOJA = 'Pictures_Muistoja',
  SOFA_MUISTOJA = 'Sofa_Muistoja',
  ARMCHAIR_MUISTOJA = 'Armchair_Muistoja',
  COFFEETABLE_MUISTOJA = 'Coffeetable_Muistoja',
  DRAWINGS_MUISTOJA = 'Drawings_Muistoja',
  FICUS_MUISTOJA = 'Ficus_Muistoja',
  FLOWERS_MUISTOJA = 'Flowers_Muistoja',
  CARPET_MUISTOJA = 'Carpet_Muistoja',
  WINDOW_MUISTOJA = 'Window_Muistoja',
  PAINTING_MUISTOJA = 'Painting_Muistoja',
  TOYFOX_MUISTOJA = 'Toyfox_Muistoja',

  // Category: Uni
  SOFA_UNI = 'Sofa_Uni',
  BED_UNI = 'Bed_Uni',
  CLOSET_UNI = 'Closet_Uni',

  // Category: Kylmä tulevaisuus
  HOLOGRAM_KYLMATULEVAISUUS = 'Hologram_KylmaTulevaisuus',
  SOFA_KYLMATULEVAISUUS = 'Sofa_KylmaTulevaisuus',
  TABLE_KYLMATULEVAISUUS = 'Table_KylmaTulevaisuus',

  // Category: Kipu
  CLOSET_KIPU = 'Closet_Kipu',
  SOFA_KIPU = 'Sofa_Kipu',
  CHAIR_KIPU = 'Chair_Kipu',
  TABLE_KIPU = 'Table_Kipu',
  PLANT_KIPU = 'Plant_Kipu',

  // Category: Kiusaaminen
  SOFA_KIUSAAMINEN = 'Sofa_Kiusaaminen',
  WINDOW_KIUSAAMINEN = 'Window_Kiusaaminen',

  // Category: Stress
  SOFA_STRESS = 'Sofa_Stress',
  CHAIR_STRESS = 'Chair_Stress',
  BED_STRESS = 'Bed_Stress',
  FLOORLAMP_STRESS = 'Floorlamp_Stress',
  FLOORSHELF_STRESS = 'Floorshelf_Stress',
  GARBAGEBIN_STRESS = 'Garbagebin_Stress',
  TABLE_STRESS = 'Table_Stress',

  // Category: Ocd
  COFFEETABLE_OCD = 'Coffeetable_Ocd',
  OVEN_OCD = 'Oven_Ocd',
  SINK_OCD = 'Sink_Ocd',
  SOFA_OCD = 'Sofa_Ocd',
  DESK_OCD = 'Desk_Ocd',
  FLOORLAMP_OCD = 'Floorlamp_Ocd',
  TOILET_OCD = 'Toilet_Ocd',

  // Category: Guilty pleasure
  FLOWER_GUILTYPLEASURE = 'Flower_GuiltyPleasure',
  CARPET_GUILTYPLEASURE = 'Carpet_GuiltyPleasure',
  LAMP_GUILTYPLEASURE = 'Lamp_GuiltyPleasure',

  // Category: Delirium
  BED_DELIRIUM = 'Bed_Delirium',
  CARPET_DELIRIUM = 'Carpet_Delirium',
  ROCKINGCHAIR = 'Rockingchair_Delirium',
  WALLCLOCK_DELIRIUM = 'Wallclock_Delirium',
  WINDOW_DELIRIUM = 'Window_Delirium',
  SOFA_DELIRIUM = 'Sofa_Delirium',
  WARDROBE_DELIRIUM = 'Wardrobe_Delirium',

  // Category: Fear Of Death
  ROCKINGCHAIR_FEAROFDEATH = 'Rockingchair_FearOfDeath',
  BED_FEAROFDEATH = 'Bed_FearOfDeath',
  CANDELABRA_FEAROFDEATH = 'Candelabra_FearOfDeath',
  WALLCLOCK_FEAROFDEATH = 'Wallclock_FearOfDeath',
  MAKEUPTABLE_FEAROFDEATH = 'Makeup-table_FearOfDeath',
  DRAWER_FEAROFDEATH = 'Drawer_FearOfDeath',
  WARDROBE_FEAROFDEATH = 'Wardrope_FearOfDeath',

  // Category: Nostalgia
  BED_NOSTALGIA = 'Bed_Nostalgia',
  SHELVING_NOSTALGIA = 'Shelving_Nostalgia',
  TOYCARS_NOSTALGIA = 'Toycars_Nostalgia',
  CARPET_NOSTALGIA = 'Carpet_Nostalgia',
  DOLLHOUSE_NOSTALGIA = 'Dollhouse_Nostalgia',
  DRAWINGS_NOSTALGIA = 'Drawings_Nostalgia',
  STICKERS_NOSTALGIA = 'Stickers_Nostalgia',
  TABLE_NOSTALGIA = 'Table_Nostalgia',
  WINDOW_NOSTALGIA = 'Window_Nostalgia',

  // Category: Nyktophobia
  BED_NYKTOPHOBIA = 'Bed_Nyktophobia',
  CLOTHESRACK_NYKTOPHOBIA = 'Clothesrack_Nyktophobia',
  WORKTABLE_NYKTOPHOBIA = 'Worktable_Nyktophobia',
  DOOR_NYKTOPHOBIA = 'Door_Nyktophobia',
  LAMP_NYKTOPHOBIA = 'Lamp_Nyktophobia',
  WINDOW_NYKTOPHOBIA = 'Window_Nyktophobia',
}
