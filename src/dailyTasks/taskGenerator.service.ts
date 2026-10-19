import { Injectable } from '@nestjs/common';
import { TASK_CONSTS } from './consts/taskConstants';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { TaskTitle } from './type/taskTitle.type';

export const MIN_OCCURRENCES_PER_TASK_TYPE = 2;

const PROPOSE_A_RULE_CHANGE_TIME_LIMIT_MINUTES = 60;

type ServerTaskDefinition = {
  type: ServerTaskName;
  createAmount: () => number;
  createTitle: (amount: number) => TaskTitle;
  timeLimitMinutes?: number;
};

export type TaskInfo = {
  title: TaskTitle;
  type: ServerTaskName;
  points: number;
  coins: number;
  amount: number;
  timeLimitMinutes: number;
};

const createRandomAmount = () =>
  Math.floor(
    Math.random() * (TASK_CONSTS.AMOUNT.MAX - TASK_CONSTS.AMOUNT.MIN + 1),
  ) + TASK_CONSTS.AMOUNT.MIN;

export const ACTIVE_SERVER_TASK_DEFINITIONS: readonly ServerTaskDefinition[] = [
  {
    type: ServerTaskName.CHANGE_THE_MUSIC,
    createAmount: createRandomAmount,
    createTitle: (amount) => ({ fi: `Vaihda musiikkia ${amount} kertaa` }),
  },
  {
    type: ServerTaskName.PLAY_A_BATTLE,
    createAmount: createRandomAmount,
    createTitle: (amount) => ({ fi: `Pelaa ${amount} taistelua` }),
  },
  {
    type: ServerTaskName.UPGRADE_A_DEFENCE_SOLDIER,
    createAmount: () => 2,
    createTitle: () => ({
      fi: 'Kehitä Defenssisoturia',
    }),
  },
  {
    type: ServerTaskName.MESSAGE_YOUR_CLAN,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Lähetä viesti klaanille',
    }),
  },
  {
    type: ServerTaskName.SPECTRUM_OF_EMOTIONS,
    createAmount: () => 6,
    createTitle: () => ({
      fi: 'Tunnekirjo chatissa',
    }),
  },
  {
    type: ServerTaskName.UPDATE_CLAN_MOTTO,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Päivitä klaanin motto',
    }),
  },
  {
    type: ServerTaskName.START_A_VOTE,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Aloita äänestys',
    }),
  },
  {
    type: ServerTaskName.CAST_YOUR_VOTE,
    createAmount: () => 1,
    createTitle: () => ({ fi: 'Äänestä päätöksestä' }),
  },
  {
    type: ServerTaskName.FURNISH_WITH_ONE_COLLECTION,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Sisusta saman malliston huonekaluilla',
    }),
  },
  {
    type: ServerTaskName.LIST_AN_ITEM_FOR_SALE,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Laita tavara myyntiin',
    }),
  },
  {
    type: ServerTaskName.PROPOSE_AN_ITEM_SALE,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Ehdota myyntiä',
    }),
  },
  {
    type: ServerTaskName.PROPOSE_A_RULE_CHANGE,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Muokkaa klaanin sääntöjä',
    }),
    timeLimitMinutes: PROPOSE_A_RULE_CHANGE_TIME_LIMIT_MINUTES,
  },
];

// each server task randomly appears at least twice
export const SERVER_TASKS_PER_CLAN =
  ACTIVE_SERVER_TASK_DEFINITIONS.length * MIN_OCCURRENCES_PER_TASK_TYPE;

@Injectable()
export class TaskGeneratorService {
  /**
   * Retrieves a random active task type for task replacements.
   */
  getRandomTaskType(): ServerTaskName {
    const randomIndex = Math.floor(
      Math.random() * ACTIVE_SERVER_TASK_DEFINITIONS.length,
    );
    return ACTIVE_SERVER_TASK_DEFINITIONS[randomIndex].type;
  }

  /**
   * Builds a shuffled task bag where every active type occurs at least the
   * configured minimum. Remaining slots retain the existing random behavior.
   */
  createBalancedTaskTypes(taskCount = SERVER_TASKS_PER_CLAN): ServerTaskName[] {
    const minimumTaskCount =
      ACTIVE_SERVER_TASK_DEFINITIONS.length * MIN_OCCURRENCES_PER_TASK_TYPE;
    if (taskCount < minimumTaskCount) {
      throw new Error(
        `Cannot generate ${taskCount} server tasks: ${minimumTaskCount} are required to include each active task type ${MIN_OCCURRENCES_PER_TASK_TYPE} times.`,
      );
    }

    const taskTypes = ACTIVE_SERVER_TASK_DEFINITIONS.flatMap(({ type }) =>
      Array<ServerTaskName>(MIN_OCCURRENCES_PER_TASK_TYPE).fill(type),
    );

    while (taskTypes.length < taskCount) {
      taskTypes.push(this.getRandomTaskType());
    }

    return this.shuffle(taskTypes);
  }

  /**
   * Creates task values for a balanced clan task pool.
   */
  createBalancedTaskValues(taskCount = SERVER_TASKS_PER_CLAN): TaskInfo[] {
    return this.createBalancedTaskTypes(taskCount).map((type) =>
      this.createTaskValues(type),
    );
  }

  /**
   * Creates one task for every server task type.
   */
  createAllServerTaskValues(): TaskInfo[] {
    return Object.values(ServerTaskName).map((type) =>
      this.createTaskValues(type),
    );
  }

  getTaskTitle(type: ServerTaskName, amount: number): TaskTitle {
    return this.getDefinition(type).createTitle(amount);
  }

  /**
   * Creates a random task for an in-day completed-task replacement.
   */
  createTaskRandomValues(): TaskInfo {
    return this.createTaskValues(this.getRandomTaskType());
  }

  private createTaskValues(type: ServerTaskName): TaskInfo {
    const definition = this.getDefinition(type);
    const amount = definition.createAmount();
    const points = TASK_CONSTS.POINTS.DAILY_TASK.SMALL;

    return {
      amount,
      points,
      coins: Math.floor(points * TASK_CONSTS.COINS.FACTOR),
      timeLimitMinutes: definition.timeLimitMinutes ?? amount * 2,
      type,
      title: definition.createTitle(amount),
    };
  }

  private getDefinition(type: ServerTaskName): ServerTaskDefinition {
    const definition = ACTIVE_SERVER_TASK_DEFINITIONS.find(
      (candidate) => candidate.type === type,
    );
    if (!definition) throw new Error(`Unknown task type: ${type}`);

    return definition;
  }

  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
}
