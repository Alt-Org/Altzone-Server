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
    defence: 2,
    hp: 1,
    size: 3,
    attack: 2,
    speed: 2,
  },
  [CharacterId.BodyBuilder_102]: {
    defence: 3,
    hp: 1,
    size: 3,
    attack: 3,
    speed: 2,
  },
  [CharacterId.PTSD_103]: {
    defence: 3,
    hp: 1,
    size: 2,
    attack: 2,
    speed: 2,
  },
  [CharacterId.Bully_104]: {
    defence: 3,
    hp: 1,
    size: 2,
    attack: 2,
    speed: 2,
  },
  [CharacterId.Arrogance_105]: {
    defence: 3,
    hp: 1,
    size: 2,
    attack: 2,
    speed: 2,
  },
  [CharacterId.Depression_106]: {
    defence: 3,
    hp: 1,
    size: 2,
    attack: 2,
    speed: 2,
  },

  [CharacterId.Joker_201]: {
    defence: 2,
    hp: 1,
    size: 2,
    attack: 2,
    speed: 6,
  },
  [CharacterId.Prankster_202]: {
    defence: 1,
    hp: 2,
    size: 2,
    attack: 2,
    speed: 6,
  },
  [CharacterId.Conman_203]: {
    defence: 2,
    hp: 2,
    size: 2,
    attack: 2,
    speed: 6,
  },
  [CharacterId.Seduction_204]: {
    defence: 3,
    hp: 2,
    size: 2,
    attack: 1,
    speed: 6,
  },

  [CharacterId.CaseHardened_301]: {
    defence: 4,
    hp: 3,
    size: 4,
    attack: 4,
    speed: 3,
  },
  [CharacterId.Pleasing_302]: {
    defence: 4,
    hp: 4,
    size: 3,
    attack: 4,
    speed: 3,
  },
  [CharacterId.Legalism_303]: {
    defence: 4,
    hp: 4,
    size: 3,
    attack: 4,
    speed: 3,
  },
  [CharacterId.Fasionism_304]: {
    defence: 3,
    hp: 3,
    size: 4,
    attack: 4,
    speed: 3,
  },
  [CharacterId.Maternal_Fixation_305]: {
    defence: 3,
    hp: 4,
    size: 4,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Superstitious_306]: {
    defence: 3,
    hp: 2,
    size: 3,
    attack: 5,
    speed: 3,
  },

  [CharacterId.Provocateur_401]: {
    defence: 3,
    hp: 6,
    size: 3,
    attack: 2,
    speed: 5,
  },
  [CharacterId.Scapegoat_402]: {
    defence: 3,
    hp: 6,
    size: 2,
    attack: 3,
    speed: 5,
  },
  [CharacterId.Projection_403]: {
    defence: 3,
    hp: 6,
    size: 2,
    attack: 3,
    speed: 5,
  },
  [CharacterId.Delusion_404]: {
    defence: 2,
    hp: 6,
    size: 2,
    attack: 3,
    speed: 5,
  },

  [CharacterId.Glutton_501]: {
    defence: 2,
    hp: 1,
    size: 3,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Alcoholic_502]: {
    defence: 3,
    hp: 1,
    size: 3,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Anorexia_503]: {
    defence: 2,
    hp: 1,
    size: 1,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Stoner_504]: {
    defence: 3,
    hp: 1,
    size: 2,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Martyrdom_505]: {
    defence: 3,
    hp: 1,
    size: 3,
    attack: 3,
    speed: 3,
  },
  [CharacterId.Self_Harm_506]: {
    defence: 3,
    hp: 1,
    size: 3,
    attack: 3,
    speed: 3,
  },

  [CharacterId.SoulSisters_601]: {
    defence: 1,
    hp: 2,
    size: 3,
    attack: 1,
    speed: 1,
  },
  [CharacterId.Limerence_602]: {
    defence: 1,
    hp: 2,
    size: 3,
    attack: 1,
    speed: 1,
  },
  [CharacterId.WakefulnessEvader_603]: {
    defence: 1,
    hp: 2,
    size: 3,
    attack: 1,
    speed: 1,
  },
  [CharacterId.Tribalism_604]: {
    defence: 2,
    hp: 1,
    size: 3,
    attack: 1,
    speed: 1,
  },
  [CharacterId.Gangism_605]: {
    defence: 2,
    hp: 1,
    size: 3,
    attack: 2,
    speed: 1,
  },

  [CharacterId.Wiseacre_701]: {
    defence: 1,
    hp: 2,
    size: 2,
    attack: 3,
    speed: 4,
  },
  [CharacterId.Capitalism_702]: {
    defence: 2,
    hp: 2,
    size: 2,
    attack: 2,
    speed: 4,
  },
  [CharacterId.Ocd_703]: {
    defence: 1,
    hp: 3,
    size: 2,
    attack: 2,
    speed: 4,
  },
};
