import { Injectable } from '@nestjs/common';
import { Score } from '../common/values/scoring.values';
import { TASK_CONSTS } from './consts/taskConstants';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { TaskTitle } from './type/taskTitle.type';

export const SERVER_TASKS_PER_CLAN = 11;
export const MIN_OCCURRENCES_PER_TASK_TYPE = 2;

type ServerTaskDefinition = {
  type: ServerTaskName;
  createAmount: () => number;
  createTitle: (amount: number) => TaskTitle;
};

type TaskInfo = {
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
    type: ServerTaskName.BANISH_THE_EARWORM,
    createAmount: createRandomAmount,
    createTitle: (amount) => ({ fi: `Karkoita korvamato ${amount} kertaa` }),
  },
  {
    type: ServerTaskName.GO_TO_BATTLE,
    createAmount: createRandomAmount,
    createTitle: (amount) => ({ fi: `Pelaa ${amount} taistelua` }),
  },
  {
    type: ServerTaskName.FORM_AN_INNER_CONNECTION,
    createAmount: createRandomAmount,
    createTitle: (amount) => ({
      fi: `Lähetä ${amount} viesti klaanichattiin`,
    }),
  },
  {
    type: ServerTaskName.INNER_VOICE,
    createAmount: () => 1,
    createTitle: () => ({
      fi: 'Avaa klaanin asetukset. Muokkaa klaanin mottoa ja tallenna muutos. Mieti, mitä haluatte viestiä toisillenne ja muille.',
    }),
  },
];

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
    const points = Score.DAILY_TASK.COMPLETED;

    return {
      amount,
      points,
      coins: Math.floor(points * TASK_CONSTS.COINS.FACTOR),
      timeLimitMinutes: amount * 2,
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
