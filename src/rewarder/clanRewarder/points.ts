import { ClanEvent } from './enum/ClanEvent.enum';
import { TASK_CONSTS } from '../../dailyTasks/consts/taskConstants';

export const points: Record<ClanEvent, number> = {
  [ClanEvent.BATTLE_WON]: TASK_CONSTS.POINTS.BATTLE.RANDOM_PAIR.WIN,
  [ClanEvent.BATTLE_LOSE]: TASK_CONSTS.POINTS.BATTLE.RANDOM_PAIR.LOSS,
};
