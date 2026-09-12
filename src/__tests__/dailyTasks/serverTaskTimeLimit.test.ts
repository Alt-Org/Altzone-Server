import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import {
  getServerTaskTimeLimitMinutes,
  TaskGeneratorService,
} from '../../dailyTasks/taskGenerator.service';

describe('getServerTaskTimeLimitMinutes() test suite', () => {
  it('Should return a fixed 60 minutes time limit for SET_BOUNDARIES regardless of the amount', () => {
    expect(
      getServerTaskTimeLimitMinutes(ServerTaskName.SET_BOUNDARIES, 1),
    ).toBe(60);
    expect(
      getServerTaskTimeLimitMinutes(ServerTaskName.SET_BOUNDARIES, 20),
    ).toBe(60);
  });

  it.each([
    ServerTaskName.BANISH_THE_EARWORM,
    ServerTaskName.GO_TO_BATTLE,
    ServerTaskName.FORM_AN_INNER_CONNECTION,
  ])('Should return amount * 2 minutes time limit for %s', (type) => {
    expect(getServerTaskTimeLimitMinutes(type, 2)).toBe(4);
    expect(getServerTaskTimeLimitMinutes(type, 20)).toBe(40);
  });

  it('Should give a generated SET_BOUNDARIES task amount 1 and 60 minutes time limit', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.SET_BOUNDARIES);

    const task = generator.createTaskRandomValues();

    expect(task.type).toBe(ServerTaskName.SET_BOUNDARIES);
    expect(task.amount).toBe(1);
    expect(getServerTaskTimeLimitMinutes(task.type, task.amount)).toBe(60);
  });
});
