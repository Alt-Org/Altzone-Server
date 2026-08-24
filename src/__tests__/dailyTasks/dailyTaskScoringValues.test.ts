import { defaultPredefinedDailyTasks } from '../../box/dailyTask/defaultPredefinedDailyTasks';
import { Score } from '../../common/values/scoring.values';
import { TaskGeneratorService } from '../../dailyTasks/taskGenerator.service';
import { uiDailyTasks } from '../../dailyTasks/uiDailyTasks/uiDailyTasks';

describe('daily task scoring values', () => {
  it('uses the shared completed daily task score for generated server tasks', () => {
    const generator = new TaskGeneratorService();

    const task = generator.createTaskRandomValues();

    expect(task.points).toBe(Score.DAILY_TASK.COMPLETED);
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
