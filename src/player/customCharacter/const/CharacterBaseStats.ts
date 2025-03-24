import {CharacterId} from "../enum/characterId.enum";

/**
 * Character stats
 */
type Stats = {
    defence: number,
    hp: number,
    size: number,
    attack: number,
    speed: number
}

/**
 * Defines base stats for the different characters ids
 */
export const CharacterBaseStats: Record<CharacterId, Stats> = {
    [CharacterId.Racist_101]: { defence: 14, hp: 1, size: 8, attack: 6, speed: 3 },
    [CharacterId.BodyBuilder_102]: { defence: 12, hp: 1, size: 8, attack: 6, speed: 3 },

    [CharacterId.Joker_201]: { defence: 5, hp: 2, size: 6, attack: 7, speed: 10 },
    [CharacterId.Prankster_202]: { defence: 3, hp: 2, size: 4, attack: 8, speed: 10 },
    [CharacterId.Conman_203]: { defence: 5, hp: 2, size: 6, attack: 7, speed: 10 },

    [CharacterId.CaseHardened_301]: { defence: 10, hp: 10, size: 10, attack: 10, speed: 10 },

    [CharacterId.Provocateur_401]: { defence: 10, hp: 3, size: 8, attack: 7, speed: 4 },

    [CharacterId.Glutton_501]: { defence: 5, hp: 2, size: 12, attack: 8, speed: 8 },
    [CharacterId.Alcoholic_502]: { defence: 8, hp: 1, size: 10, attack: 9, speed: 8 },

    [CharacterId.SoulSisters_601]: { defence: 11, hp: 2, size: 12, attack: 2, speed: 2 },
    [CharacterId.WakefulnessEvader_603]: { defence: 11, hp: 2, size: 12, attack: 2, speed: 2 },

    [CharacterId.Wiseacre_701]: { defence: 3, hp: 8, size: 8, attack: 10, speed: 6 }
}
