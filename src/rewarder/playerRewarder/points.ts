import { PlayerEvent } from './enum/PlayerEvent.enum';
import { TASK_CONSTS } from '../../dailyTasks/consts/taskConstants';

export const points: Record<PlayerEvent, number> = {
  [PlayerEvent.BATTLE_WON]: TASK_CONSTS.POINTS.BATTLE.RANDOM_PAIR.WIN,
  [PlayerEvent.BATTLE_LOSE]: TASK_CONSTS.POINTS.BATTLE.RANDOM_PAIR.LOSS,
};