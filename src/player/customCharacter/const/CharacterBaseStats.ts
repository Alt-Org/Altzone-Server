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

/**
 * Defines base stats for the different characters ids
 */
export const CharacterBaseStats: Record<CharacterId, Stats> = {
  [CharacterId.Racist_101]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },
  [CharacterId.BodyBuilder_102]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },
  [CharacterId.PTSD_103]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },
  [CharacterId.Bully_104]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },
  [CharacterId.Arrogance_105]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },
  [CharacterId.Depression_106]: {
    defence: 10,
    hp: 6,
    size: 6,
    attack: 4,
    speed: 4,
  },

  [CharacterId.Joker_201]: {
    defence: 5,
    hp: 5,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Prankster_202]: {
    defence: 5,
    hp: 5,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Conman_203]: {
    defence: 5,
    hp: 5,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Seduction_204]: {
    defence: 5,
    hp: 5,
    size: 4,
    attack: 8,
    speed: 8,
  },

  [CharacterId.CaseHardened_301]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },
  [CharacterId.Pleasing_302]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },
  [CharacterId.Legalism_303]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },
  [CharacterId.Fasionism_304]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },
  [CharacterId.Maternal_Fixation_305]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },
  [CharacterId.Superstitious_306]: {
    defence: 6,
    hp: 6,
    size: 6,
    attack: 6,
    speed: 6,
  },

  [CharacterId.Provocateur_401]: {
    defence: 8,
    hp: 3,
    size: 3,
    attack: 6,
    speed: 10,
  },
  [CharacterId.Scapegoat_402]: {
    defence: 8,
    hp: 3,
    size: 3,
    attack: 6,
    speed: 10,
  },
  [CharacterId.Projection_403]: {
    defence: 8,
    hp: 3,
    size: 3,
    attack: 6,
    speed: 10,
  },
  [CharacterId.Delusion_404]: {
    defence: 8,
    hp: 3,
    size: 3,
    attack: 6,
    speed: 10,
  },

  [CharacterId.Glutton_501]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },
  [CharacterId.Alcoholic_502]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },
  [CharacterId.Anorexia_503]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },
  [CharacterId.Stoner_504]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },
  [CharacterId.Martyrdom_505]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },
  [CharacterId.Self_Harm_506]: {
    defence: 8,
    hp: 5,
    size: 8,
    attack: 3,
    speed: 6,
  },

  [CharacterId.SoulSisters_601]: {
    defence: 9,
    hp: 1,
    size: 10,
    attack: 8,
    speed: 2,
  },
  [CharacterId.Limerence_602]: {
    defence: 9,
    hp: 1,
    size: 10,
    attack: 8,
    speed: 2,
  },
  [CharacterId.WakefulnessEvader_603]: {
    defence: 9,
    hp: 1,
    size: 10,
    attack: 8,
    speed: 2,
  },
  [CharacterId.Tribalism_604]: {
    defence: 9,
    hp: 1,
    size: 10,
    attack: 8,
    speed: 2,
  },
  [CharacterId.Gangism_605]: {
    defence: 9,
    hp: 1,
    size: 10,
    attack: 8,
    speed: 2,
  },

  [CharacterId.Wiseacre_701]: {
    defence: 6,
    hp: 4,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Capitalism_702]: {
    defence: 6,
    hp: 4,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Ocd_703]: {
    defence: 6,
    hp: 4,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Overcomplication_704]: {
    defence: 6,
    hp: 4,
    size: 4,
    attack: 8,
    speed: 8,
  },
  [CharacterId.Nitpicking_705]: {
    defence: 6,
    hp: 4,
    size: 4,
    attack: 8,
    speed: 8,
  },
};
