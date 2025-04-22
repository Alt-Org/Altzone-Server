import { PlayerEvent } from './enum/PlayerEvent.enum';

export const points: Record<PlayerEvent, number> = {
  [PlayerEvent.MESSAGE_SENT]: 20,
  [PlayerEvent.BATTLE_WON]: 50,
  [PlayerEvent.BATTLE_PLAYED]: 10,
  [PlayerEvent.VOTE_MADE]: 10,
};
