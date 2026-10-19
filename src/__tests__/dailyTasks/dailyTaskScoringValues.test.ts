import { defaultPredefinedDailyTasks } from '../../box/dailyTask/defaultPredefinedDailyTasks';
import {
  ACTIVE_SERVER_TASK_DEFINITIONS,
  MIN_OCCURRENCES_PER_TASK_TYPE,
  SERVER_TASKS_PER_CLAN,
  TaskGeneratorService,
} from '../../dailyTasks/taskGenerator.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { uiDailyTasks } from '../../dailyTasks/uiDailyTasks/uiDailyTasks';
import { TASK_CONSTS } from '../../dailyTasks/consts/taskConstants';

describe('daily task scoring values', () => {
  it('uses the shared completed daily task score for generated server tasks', () => {
    const generator = new TaskGeneratorService();

    const task = generator.createTaskRandomValues();

    expect(task.points).toBe(TASK_CONSTS.POINTS.DAILY_TASK.SMALL);
  });

  it('configures UPDATE_CLAN_MOTTO as a one-step clan motto task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.UPDATE_CLAN_MOTTO);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.UPDATE_CLAN_MOTTO,
      amount: 1,
      title: {
        fi: 'Päivitä klaanin motto',
      },
    });
  });

  it('configures CAST_YOUR_VOTE as a one-step clan-voting task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.CAST_YOUR_VOTE);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.CAST_YOUR_VOTE,
      amount: 1,
      title: { fi: 'Äänestä päätöksestä' },
    });
  });

  it('configures START_A_VOTE as a one-step server task', () => {
    const generator = new TaskGeneratorService();
    const task = generator
      .createAllServerTaskValues()
      .find(({ type }) => type === ServerTaskName.START_A_VOTE);

    expect(task).toMatchObject({
      type: ServerTaskName.START_A_VOTE,
      amount: 1,
    });
  });

  it('creates exactly one task for every server task type', () => {
    const generator = new TaskGeneratorService();
    const tasks = generator.createAllServerTaskValues();
    const taskTypes = tasks.map(({ type }) => type);

    expect(tasks).toHaveLength(Object.values(ServerTaskName).length);
    expect(new Set(taskTypes).size).toBe(Object.values(ServerTaskName).length);
    expect(taskTypes).toEqual(
      expect.arrayContaining(Object.values(ServerTaskName)),
    );
  });

  it('configures SPECTRUM_OF_EMOTIONS with one step for each chat emotion', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.SPECTRUM_OF_EMOTIONS);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.SPECTRUM_OF_EMOTIONS,
      amount: 6,
    });
  });

  it('configures UPGRADE_A_DEFENCE_SOLDIER as a two-step server task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.UPGRADE_A_DEFENCE_SOLDIER);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.UPGRADE_A_DEFENCE_SOLDIER,
      amount: 2,
      title: {
        fi: 'Kehitä Defenssisoturia',
      },
    });
  });

  it('configures FURNISH_WITH_ONE_COLLECTION as a one-step room-layout task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.FURNISH_WITH_ONE_COLLECTION);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.FURNISH_WITH_ONE_COLLECTION,
      amount: 1,
      title: {
        fi: 'Sisusta saman malliston huonekaluilla',
      },
    });
  });

  it('configures LIST_AN_ITEM_FOR_SALE as a one-step flea-market listing task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.LIST_AN_ITEM_FOR_SALE);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.LIST_AN_ITEM_FOR_SALE,
      amount: 1,
      title: {
        fi: 'Laita tavara myyntiin',
      },
    });
  });

  it('configures PROPOSE_AN_ITEM_SALE as a one-step sell-voting task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.PROPOSE_AN_ITEM_SALE);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.PROPOSE_AN_ITEM_SALE,
      amount: 1,
      title: {
        fi: 'Ehdota myyntiä',
      },
    });
  });

  it('creates a balanced, shuffled server-task bag', () => {
    const generator = new TaskGeneratorService();
    const taskTypes = generator.createBalancedTaskTypes();

    expect(taskTypes).toHaveLength(SERVER_TASKS_PER_CLAN);
    for (const { type } of ACTIVE_SERVER_TASK_DEFINITIONS) {
      expect(
        taskTypes.filter((taskType) => taskType === type).length,
      ).toBeGreaterThanOrEqual(MIN_OCCURRENCES_PER_TASK_TYPE);
    }
  });

  it('fails clearly when the requested task count cannot satisfy the minimum occurrence guarantee', () => {
    const generator = new TaskGeneratorService();

    expect(() => generator.createBalancedTaskTypes(1)).toThrow(
      'Cannot generate 1 server tasks',
    );
  });

  it('uses the shared completed daily task score for default predefined tasks', () => {
    expect(defaultPredefinedDailyTasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
        }),
      ]),
    );
    expect(
      defaultPredefinedDailyTasks.every(
        (task) => task.points === TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
      ),
    ).toBe(true);
  });

  it('uses the shared completed daily task score for UI daily tasks', () => {
    expect(
      Object.values(uiDailyTasks).every(
        (task) => task.points === TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
      ),
    ).toBe(true);
  });
});
