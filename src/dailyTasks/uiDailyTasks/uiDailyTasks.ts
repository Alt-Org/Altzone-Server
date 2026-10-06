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
  [UITaskName.FIND_THE_ERROR]: {
    title: {
      fi: 'Etsi sisäinen toimintahäiriö.',
    },
    type: UITaskName.FIND_THE_ERROR,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PLAY_MELODY]: {
    title: {
      fi: 'Soita sävelmä.',
    },
    type: UITaskName.PLAY_MELODY,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHOOSE_YOUR_TRUTH]: {
    title: {
      fi: 'Valitse prologin näkymä, joka herättää eniten tunnistettavan tunteen.',
    },
    type: UITaskName.CHOOSE_YOUR_TRUTH,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.HOLD_THE_CHARACTER]: {
    title: {
      fi: 'Pysähdy defenssisoturin äärelle ja kuuntele sen taustaa.',
    },
    type: UITaskName.HOLD_THE_CHARACTER,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHERE_ARE_YOU]: {
    title: {
      fi: 'Tunnista tila, jossa sisäinen tapahtuma tapahtuu.',
    },
    type: UITaskName.WHERE_ARE_YOU,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FOLLOW_THE_VOICE]: {
    title: {
      fi: 'Etsi ohjeet jotka oikeasti ohjaavat toimintaasi.',
    },
    type: UITaskName.FOLLOW_THE_VOICE,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.READ_THE_SIGNS]: {
    title: { fi: 'Etsi symboli, joka ei selitä itseään vaan ehdottaa.' },
    type: UITaskName.READ_THE_SIGNS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_THE_ROOTS]: {
    title: { fi: 'Löydä osa, jossa toisen vaikutus on muokannut sinua.' },
    type: UITaskName.FIND_THE_ROOTS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.LOOK_INSIDE]: {
    title: { fi: 'Tunnista, millainen rakenne sinua ohjaa.' },
    type: UITaskName.LOOK_INSIDE,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.USE_OF_POWER]: {
    title: {
      fi: 'Missä käyt sisäisen valtataistelusi tai punnitset eri vaihtoehtoja?',
    },
    type: UITaskName.USE_OF_POWER,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.COMMON_FACTOR]: {
    title: {
      fi: 'Mitä olet oppinut joltain toiselta? Etsi teitä yhdistävä asia.',
    },
    type: UITaskName.COMMON_FACTOR,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.SPIRITUAL_CURRENCY]: {
    title: { fi: 'Etsi pelistä henkisen valuutan symboli.' },
    type: UITaskName.SPIRITUAL_CURRENCY,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.REWARD_TRAPS]: {
    title: { fi: 'Tunnista, missä syntyy dopamiinia ja onnistumisen tunnetta.' },
    type: UITaskName.REWARD_TRAPS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.MORAL_DILEMMAS]: {
    title: {
      fi: 'Etsi kohta, jossa jouduit pohtimaan oikean ja väärän merkitystä.',
    },
    type: UITaskName.MORAL_DILEMMAS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.ECO_FRIENDLY]: {
    title: { fi: 'Huomaa, miten toimintasi jättää jäljen tähän maailmaan.' },
    type: UITaskName.ECO_FRIENDLY,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.HUNTING_FOR_VALUES]: {
    title: { fi: 'Miten ohjenuorasi rakentuu? Minkälaisia arvoja edustat?' },
    type: UITaskName.HUNTING_FOR_VALUES,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.ETHICS_METRICS]: {
    title: { fi: 'Kumpi soturisi kulkee parempaa polkua?' },
    type: UITaskName.ETHICS_METRICS,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  }
};
