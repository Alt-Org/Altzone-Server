import { PlayerEvent } from './enum/PlayerEvent.enum';

export const points: Record<PlayerEvent, number> = {
  [PlayerEvent.BATTLE_WON]: 50,
};
