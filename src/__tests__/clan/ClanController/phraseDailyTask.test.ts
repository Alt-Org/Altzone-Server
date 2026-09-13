import { ClanController } from '../../../clan/clan.controller';
import ClanNotifier from '../../../clan/clan.notifier';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';

describe('ClanController phrase daily task', () => {
  const clanId = '67fe4e2d8a54d4cc39266a43';

  const createController = ({
    currentPhrase = 'Together we rise',
    updateResult = [true, null],
    taskErrors = null,
  }: {
    currentPhrase?: string;
    updateResult?: [boolean | null, any[] | null];
    taskErrors?: any[] | null;
  } = {}) => {
    const clanService = {
      readOneById: jest
        .fn()
        .mockResolvedValue([{ phrase: currentPhrase }, null]),
      updateOneById: jest.fn().mockResolvedValue(updateResult),
    };
    const progressResult = {
      status: 'completed',
      task: {
        type: ServerTaskName.INNER_VOICE,
        points: 10,
        coins: 5,
        clan_id: clanId,
      },
      completedByPlayerId: 'player-1',
      clanId,
      completedAmount: 1,
      previousAmountLeft: 1,
      currentAmountLeft: 0,
    };
    const dailyTasksService = {
      updateClanTask: jest
        .fn()
        .mockResolvedValue([taskErrors ? null : progressResult, taskErrors]),
    };
    const dailyTaskProgressService = {
      handleClanTaskCompletion: jest
        .fn()
        .mockResolvedValue([progressResult, null]),
      notifyClanTaskCompletion: jest.fn(),
    };
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      endSession: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      abortTransaction: jest.fn(),
    };
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    const notifier = jest
      .spyOn(ClanNotifier.prototype, 'phraseUpdated')
      .mockImplementation();
    const controller = new ClanController(
      clanService as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      dailyTasksService as any,
      dailyTaskProgressService as any,
      connection as any,
    );

    return {
      clanService,
      controller,
      dailyTasksService,
      dailyTaskProgressService,
      notifier,
      session,
    };
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('completes the clan task and publishes a clan update after saving a changed phrase', async () => {
    const {
      clanService,
      controller,
      dailyTasksService,
      dailyTaskProgressService,
      notifier,
      session,
    } = createController();
    const body = { _id: clanId, phrase: 'Victory or nothing!' } as any;
    const user = { clan_id: clanId, player_id: 'player-1' } as any;

    await controller.update(body, user);

    expect(clanService.updateOneById).toHaveBeenCalledWith(clanId, body, {
      session,
    });
    expect(dailyTasksService.updateClanTask).toHaveBeenCalledWith(
      clanId,
      'player-1',
      ServerTaskName.INNER_VOICE,
      session,
    );
    expect(
      dailyTaskProgressService.handleClanTaskCompletion,
    ).toHaveBeenCalledWith(
      expect.any(Object),
      session,
      false,
    );
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(dailyTaskProgressService.notifyClanTaskCompletion).toHaveBeenCalled();
    expect(notifier).toHaveBeenCalledWith(clanId, 'Victory or nothing!');
  });

  it('does not progress the task or publish MQTT when the phrase is unchanged', async () => {
    const { controller, dailyTasksService, notifier } = createController();
    const body = { _id: clanId, phrase: 'Together we rise' } as any;
    const user = { clan_id: clanId, player_id: 'player-1' } as any;

    await controller.update(body, user);

    expect(dailyTasksService.updateClanTask).not.toHaveBeenCalled();
    expect(notifier).not.toHaveBeenCalled();
  });

  it('rolls back the phrase update and publishes no notifications when clan-task progression fails', async () => {
    const { controller, dailyTaskProgressService, notifier, session } =
      createController({
        taskErrors: [{ reason: SEReason.UNEXPECTED }],
      });
    const body = { _id: clanId, phrase: 'Victory or nothing!' } as any;
    const user = { clan_id: clanId, player_id: 'player-1' } as any;

    await controller.update(body, user);

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.commitTransaction).not.toHaveBeenCalled();
    expect(
      dailyTaskProgressService.notifyClanTaskCompletion,
    ).not.toHaveBeenCalled();
    expect(notifier).not.toHaveBeenCalled();
  });
});
