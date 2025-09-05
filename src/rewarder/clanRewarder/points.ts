import { ClanEvent } from './enum/ClanEvent.enum';

export const points: Record<ClanEvent, number> = {
  [ClanEvent.BATTLE_WON]: 100,
  [ClanEvent.BATTLE_LOSE]: -20,
};
