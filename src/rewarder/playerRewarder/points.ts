import { PlayerEvent } from './enum/PlayerEvent.enum';
import { Score } from '../../common/values/scoring.values';

export const points: Record<PlayerEvent, number> = {
  [PlayerEvent.BATTLE_WON]: Score.BATTLE.WIN,
  [PlayerEvent.BATTLE_LOSE]: Score.BATTLE.LOSS,
};
