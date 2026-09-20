import { defaultPredefinedDailyTasks } from '../../box/dailyTask/defaultPredefinedDailyTasks';
import { Score } from '../../common/values/scoring.values';
import {
  ACTIVE_SERVER_TASK_DEFINITIONS,
  MIN_OCCURRENCES_PER_TASK_TYPE,
  SERVER_TASKS_PER_CLAN,
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

  it('configures YOUR_VOICE as a one-step clan-voting task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.YOUR_VOICE);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.YOUR_VOICE,
      amount: 1,
      title: { fi: 'Äänestä klaanin äänestyksessä.' },
    });
  });

  it('configures PLAY_WITH_EMOTIONS with one step for each chat emotion', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.PLAY_WITH_EMOTIONS);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.PLAY_WITH_EMOTIONS,
      amount: 6,
    });
  });

  it('configures BUILD_YOUR_WORLD as a one-step room-layout task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.BUILD_YOUR_WORLD);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.BUILD_YOUR_WORLD,
      amount: 1,
      title: {
        fi: 'Sisusta yksi klaanin Turvapaikan huone vähintään kolmella saman malliston huonekalulla.',
      },
    });
  });

  it('configures RECYCLING_EXPERIENCES as a one-step flea-market listing task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.RECYCLING_EXPERIENCES);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.RECYCLING_EXPERIENCES,
      amount: 1,
      title: {
        fi: 'Avaa klaanin kirpputori. Valitse äänestyksessä myytäväksi hyväksytty tavara ja lisää se myytäväksi. Katso, miten muut reagoivat ja miltä tuntuu kun tavara alkaa liikkua pelaajien välillä.',
      },
    });
  });

  it('configures LETTING_GO_OF_THE_OLD as a one-step sell-voting task', () => {
    const generator = new TaskGeneratorService();
    jest
      .spyOn(generator, 'getRandomTaskType')
      .mockReturnValue(ServerTaskName.LETTING_GO_OF_THE_OLD);

    expect(generator.createTaskRandomValues()).toMatchObject({
      type: ServerTaskName.LETTING_GO_OF_THE_OLD,
      amount: 1,
      title: {
        fi: 'Avaa klaanin äänestys. Valitse vaihtoehto ja anna äänesi. Huomaa, miten oma valintasi vaikuttaa yhteiseen päätökseen.',
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
