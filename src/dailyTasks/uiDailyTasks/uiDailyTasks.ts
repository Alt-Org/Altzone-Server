import { UITaskName } from '../enum/uiTaskName.enum';
import { TaskTitle } from '../type/taskTitle.type';
import { TASK_CONSTS } from '../consts/taskConstants';

/**
 * UI daily task basic information
 */
export type UIDailyTaskData = {
  title: TaskTitle;
  type: UITaskName;
  points: number;
  coins: number;
  amount: number;
  timeLimitMinutes: number;
};

/**
 * Record with basic information about each UI managed daily task
 */
export const uiDailyTasks: Record<UITaskName, UIDailyTaskData> = {
  [UITaskName.SPOT_THE_GLITCH]: {
    title: {
      fi: 'Ohjelmistovirheen metsästys',
    },
    type: UITaskName.SPOT_THE_GLITCH,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PLAY_UKKO_NOOA]: {
    title: {
      fi: 'Soita Ukko Nooa',
    },
    type: UITaskName.PLAY_UKKO_NOOA,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHOOSE_A_STORY_SCENE]: {
    title: {
      fi: 'Valitse tarinan koskettavin ruutu',
    },
    type: UITaskName.CHOOSE_A_STORY_SCENE,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.LEARN_ABOUT_A_DEFENCE_SOLDIER]: {
    title: {
      fi: 'Tutustu defenssisoturiin',
    },
    type: UITaskName.LEARN_ABOUT_A_DEFENCE_SOLDIER,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.IDENTIFY_THE_SETTING]: {
    title: {
      fi: 'Tunnista pelin tapahtumapaikka',
    },
    type: UITaskName.IDENTIFY_THE_SETTING,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_AN_INSTRUCTION]: {
    title: {
      fi: 'Etsi kolme peliopastetta',
    },
    type: UITaskName.FIND_AN_INSTRUCTION,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.IDENTIFY_A_SYMBOL]: {
    title: { fi: 'Tunnista pelin symboli' },
    type: UITaskName.IDENTIFY_A_SYMBOL,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.SPOT_A_CULTURAL_REFERENCE]: {
    title: { fi: 'Etsi kulttuuriviite' },
    type: UITaskName.SPOT_A_CULTURAL_REFERENCE,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.IDENTIFY_THE_GAME_GENRE]: {
    title: { fi: 'Tunnista pelin genre' },
    type: UITaskName.IDENTIFY_THE_GAME_GENRE,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.LOCATE_DECISION_MAKING]: {
    title: {
      fi: 'Etsi päätöksenteon näkymä',
    },
    type: UITaskName.LOCATE_DECISION_MAKING,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.IDENTIFY_GAME_INFLUENCES]: {
    title: { fi: 'Etsi henkinen valuutta' },
    type: UITaskName.IDENTIFY_GAME_INFLUENCES,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.SPOT_THE_REWARD]: {
    title: {
      fi: 'Tunnista palkitseminen',
    },
    type: UITaskName.SPOT_THE_REWARD,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_THE_CARBON_FOOTPRINT_METER]: {
    title: { fi: 'Etsi hiilijalanjälkimittari' },
    type: UITaskName.FIND_THE_CARBON_FOOTPRINT_METER,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.IDENTIFY_GAME_VALUES]: {
    title: { fi: 'Tunnista pelin arvot' },
    type: UITaskName.IDENTIFY_GAME_VALUES,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.COMPARE_DEFENCE_SOLDIERS]: {
    title: { fi: 'Vertaile defenssisotureita' },
    type: UITaskName.COMPARE_DEFENCE_SOLDIERS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
};
