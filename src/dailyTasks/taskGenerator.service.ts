import { Injectable } from '@nestjs/common';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { TASK_CONSTS } from './consts/taskConstants';
import { TaskTitle } from './type/taskTitle.type';
import { Score } from '../common/values/scoring.values';

type TaskInfo = {
  title: TaskTitle;
  type: ServerTaskName;
  points: number;
  coins: number;
  amount: number;
};

const GENERATED_SERVER_TASK_TYPES = [
  ServerTaskName.BANISH_THE_EARWORM,
  ServerTaskName.GO_TO_BATTLE,
  ServerTaskName.FORM_AN_INNER_CONNECTION,
  ServerTaskName.SET_BOUNDARIES,
];

const SET_BOUNDARIES_TIME_LIMIT_MINUTES = 60;

/**
 * Returns the time limit for a server task.
 *
 * Some tasks like SET_BOUNDARIES has always amount 1 so it should get a fixed time limit.
 * @param type - The type of the task.
 * @param amount - The amount of the task.
 * @returns The time limit in minutes.
 */
export function getServerTaskTimeLimitMinutes(
  type: ServerTaskName,
  amount: number,
): number {
  if (type === ServerTaskName.SET_BOUNDARIES) {
    return SET_BOUNDARIES_TIME_LIMIT_MINUTES;
  }

  return amount * 2;
}

@Injectable()
export class TaskGeneratorService {
  constructor() {}

  /**
   * Retrieves a random task type from the available task names enum.
   *
   * @returns A randomly selected task name.
   */
  getRandomTaskType(): ServerTaskName {
    const randomIndex = Math.floor(
      Math.random() * GENERATED_SERVER_TASK_TYPES.length,
    );
    return GENERATED_SERVER_TASK_TYPES[randomIndex];
  }

  /**
   * Generates a task title based on the task type and amount.
   *
   * @param type - The type of the task.
   * @param amount - The number associated with the task.
   * @returns The generated task title as a string.
   * @throws Will throw an error if the task type is unknown.
   */
  getTaskTitle(type: ServerTaskName, amount: number): TaskTitle {
    switch (type) {
      case ServerTaskName.BANISH_THE_EARWORM:
        return { fi: `Karkoita korvamato ${amount} kertaa` };
      case ServerTaskName.GO_TO_BATTLE:
        return { fi: `Pelaa ${amount} taistelua` };
      case ServerTaskName.FORM_AN_INNER_CONNECTION:
        return { fi: `Lähetä ${amount} viesti klaanichattiin` };
      case ServerTaskName.SET_BOUNDARIES:
        return {
          fi: 'Avaa klaanin säännöt ja muokkaa niitä. Säännöt muovaavat sitä, millainen yhteisö te olette. Mieti, mitä toimintaa haluatte vahvistaa.',
        };
      default:
        throw new Error('Unknown task type');
    }
  }

  /**
   * Generates a random task with random values for amount, points, coins, type, and title.
   *
   * @returns A partial Task missing the ids and startedAt fields and object containing randomly generated values.
   */
  createTaskRandomValues(): TaskInfo {
    let amount =
      Math.floor(
        Math.random() * (TASK_CONSTS.AMOUNT.MAX - TASK_CONSTS.AMOUNT.MIN + 1),
      ) + TASK_CONSTS.AMOUNT.MIN;
    const points = Score.DAILY_TASK.COMPLETED;
    const coins = Math.floor(points * TASK_CONSTS.COINS.FACTOR);
    const taskType = this.getRandomTaskType();

    if (taskType === ServerTaskName.SET_BOUNDARIES) {
      amount = 1;
    }

    const titleString = this.getTaskTitle(taskType, amount);

    return {
      amount,
      points,
      coins,
      type: taskType,
      title: titleString,
    };
  }
}
