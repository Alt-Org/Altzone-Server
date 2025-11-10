import { CharacterId } from '../enum/characterId.enum';

/**
 * Character stats
 */
type Stats = {
  defence: number;
  hp: number;
  size: number;
  attack: number;
  speed: number;
};

// Max level amount for character stat
type Level = 1 | 2 | 3 | 4 | 5 | 6;

type LevelStats = Record<Level, number>;

// Table for character defence stats per level
const defence: LevelStats = {
  1: 250,
  2: 375,
  3: 500,
  4: 625,
  5: 750,
  6: 875,
};

// Table for character hp stats per level
const hp: LevelStats = {
  1: 15,
  2: 30,
  3: 45,
  4: 60,
  5: 75,
  6: 90,
};

// Table for character size stats per level
const size: LevelStats = {
  1: 8,
  2: 8,
  3: 8,
  4: 14,
  5: 14,
  6: 14,
};

// Table for character attack stats per level
const attack: LevelStats = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 35,
};

// Table for character speed stats per level
const speed: LevelStats = {
  1: 10,
  2: 12,
  3: 14,
  4: 16,
  5: 18,
  6: 20,
};

/**
 * Defines base stats for the different characters ids
 */
export const CharacterBaseStats: Record<CharacterId, Stats> = {
  [CharacterId.Racist_101]: {
    defence: defence[2],
    hp: hp[1],
    size: size[3],
    attack: attack[2],
    speed: speed[2],
  },
  [CharacterId.BodyBuilder_102]: {
    defence: defence[3],
    hp: hp[1],
    size: size[3],
    attack: attack[3],
    speed: speed[2],
  },
  [CharacterId.Bully_104]: {
    defence: defence[3],
    hp: hp[1],
    size: size[2],
    attack: attack[2],
    speed: speed[2],
  },

  [CharacterId.Joker_201]: {
    defence: defence[2],
    hp: hp[1],
    size: size[2],
    attack: attack[2],
    speed: speed[4],
  },
  [CharacterId.Prankster_202]: {
    defence: defence[1],
    hp: hp[2],
    size: size[2],
    attack: attack[2],
    speed: speed[4],
  },
  [CharacterId.Conman_203]: {
    defence: defence[2],
    hp: hp[2],
    size: size[2],
    attack: attack[2],
    speed: speed[4],
  },
  [CharacterId.Seduction_204]: {
    defence: defence[3],
    hp: hp[2],
    size: size[2],
    attack: attack[1],
    speed: speed[4],
  },

  [CharacterId.CaseHardened_301]: {
    defence: defence[4],
    hp: hp[3],
    size: size[4],
    attack: attack[4],
    speed: speed[5],
  },
  [CharacterId.Pleasing_302]: {
    defence: defence[4],
    hp: hp[4],
    size: size[3],
    attack: attack[4],
    speed: speed[5],
  },

  // 400 code characters don't have HP
  // currently server should just set the default
  // hp for 400 code characters as 0
  [CharacterId.Provocateur_401]: {
    defence: defence[3],
    hp: 0,
    size: size[3],
    attack: attack[2],
    speed: speed[3],
  },
  [CharacterId.Scapegoat_402]: {
    defence: defence[3],
    hp: 0,
    size: size[2],
    attack: attack[3],
    speed: speed[3],
  },
  [CharacterId.Projection_403]: {
    defence: defence[3],
    hp: 0,
    size: size[2],
    attack: attack[3],
    speed: speed[3],
  },
  [CharacterId.Delusion_404]: {
    defence: defence[2],
    hp: 0,
    size: size[2],
    attack: attack[3],
    speed: speed[3],
  },

  [CharacterId.Glutton_501]: {
    defence: defence[2],
    hp: hp[1],
    size: size[3],
    attack: attack[3],
    speed: speed[3],
  },
  [CharacterId.Alcoholic_502]: {
    defence: defence[3],
    hp: hp[1],
    size: size[3],
    attack: attack[3],
    speed: speed[3],
  },
  [CharacterId.Martyrdom_505]: {
    defence: defence[3],
    hp: hp[1],
    size: size[3],
    attack: attack[3],
    speed: speed[3],
  },

  [CharacterId.SoulSisters_601]: {
    defence: defence[1],
    hp: hp[2],
    size: size[3],
    attack: attack[1],
    speed: speed[1],
  },
  [CharacterId.Limerence_602]: {
    defence: defence[1],
    hp: hp[2],
    size: size[3],
    attack: attack[1],
    speed: speed[1],
  },
  [CharacterId.WakefulnessEvader_603]: {
    defence: defence[1],
    hp: hp[2],
    size: size[3],
    attack: attack[1],
    speed: speed[1],
  },

  [CharacterId.Wiseacre_701]: {
    defence: defence[1],
    hp: hp[2],
    size: size[2],
    attack: attack[3],
    speed: speed[6],
  },
  [CharacterId.Ocd_703]: {
    defence: defence[1],
    hp: hp[3],
    size: size[2],
    attack: attack[2],
    speed: speed[6],
  },
};
