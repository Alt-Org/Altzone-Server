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
 * Defines base stats for new created characters
 */
export const NewCharacterBase: Stats = {
  defence: 0,
  hp: 0,
  size: 0,
  attack: 0,
  speed: 0,
};
