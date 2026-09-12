import { defaultPredefinedDailyTasks } from '../../box/dailyTask/defaultPredefinedDailyTasks';
import { Score } from '../../common/values/scoring.values';
import {
  ACTIVE_SERVER_TASK_DEFINITIONS,
  MIN_OCCURRENCES_PER_TASK_TYPE,
  TaskGeneratorService,
} from '../../dailyTasks/taskGenerator.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { uiDailyTasks } from '../../dailyTasks/uiDailyTasks/uiDailyTasks';

describe('daily task scoring values', () => {
  it('uses the shared completed daily task score for generated server tasks', () => {
    const generator = new TaskGeneratorService();

    const task = generator.createTaskRandomValues();

    expect(task.points).toBe(Score.DAILY_TASK.COMPLETED);
  });

  it('configures INNER_VOICE as a one-step clan motto task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.INNER_VOICE);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.INNER_VOICE,
      amount: 1,
      title: {
        fi: 'Avaa klaanin asetukset. Muokkaa klaanin mottoa ja tallenna muutos. Mieti, mitä haluatte viestiä toisillenne ja muille.',
      },
    });
  });

  it('creates a balanced, shuffled server-task bag', () => {
    const generator = new TaskGeneratorService();
    const taskTypes = generator.createBalancedTaskTypes();

    expect(taskTypes).toHaveLength(11);
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
        expect.objectContaining({ points: Score.DAILY_TASK.COMPLETED }),
      ]),
    );
    expect(
      defaultPredefinedDailyTasks.every(
        (task) => task.points === Score.DAILY_TASK.COMPLETED,
      ),
    ).toBe(true);
  });

  it('uses the shared completed daily task score for UI daily tasks', () => {
    expect(
      Object.values(uiDailyTasks).every(
        (task) => task.points === Score.DAILY_TASK.COMPLETED,
      ),
    ).toBe(true);
  });
});
