import { ClanEvent } from './enum/ClanEvent.enum';
import { Score } from '../../common/values/scoring.values';

export const points: Record<ClanEvent, number> = {
  [ClanEvent.BATTLE_WON]: Score.BATTLE.WIN,
  [ClanEvent.BATTLE_LOSE]: Score.BATTLE.LOSS,
};
