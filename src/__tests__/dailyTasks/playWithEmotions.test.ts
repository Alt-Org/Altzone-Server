import { Connection } from 'mongoose';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { ChatEmotion } from '../../chat/enum/chatEmotion.enum';
import { ChatResponseType } from '../../chat/enum/chatResponseType.enum';

describe('PLAY_WITH_EMOTIONS daily task', () => {
  const createService = (updatedTask: any = null) => {
    const model = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(updatedTask),
      })),
    };
    const progressService = { handleProgress: jest.fn() };
    const service = new DailyTasksService(
      model as any,
      {} as Connection,
      {} as any,
      {} as any,
      {
        createTaskRandomValues: jest.fn().mockReturnValue({
          type: ServerTaskName.GO_TO_BATTLE,
          amount: 2,
          points: 10,
          coins: 5,
          title: { fi: 'Pelaa 2 taistelua' },
          timeLimitMinutes: 4,
        }),
      } as any,
      progressService as any,
    );
    const basicService = {
      updateOne: jest.fn().mockResolvedValue([true, null]),
    };
    (service as any).basicService = basicService;

    return { basicService, model, progressService, service };
  };

  it('starts a response sequence with Blank and decrements once', async () => {
    const updatedTask = {
      _id: 'task-1',
      clan_id: 'clan-1',
      amountLeft: 5,
      progress: {
        key: ChatResponseType.NEED_COMPANY,
        steps: [ChatEmotion.BLANK],
      },
    };
    const { model, service } = createService(updatedTask);

    const [result, errors] = await service.updatePlayWithEmotionsTask(
      'player-1',
      'clan-1',
      ChatResponseType.NEED_COMPANY,
      ChatEmotion.BLANK,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({
      status: 'advanced',
      previousAmountLeft: 6,
      currentAmountLeft: 5,
      completedAmount: 1,
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        player_id: 'player-1',
        clan_id: 'clan-1',
        type: ServerTaskName.PLAY_WITH_EMOTIONS,
        $or: [
          { 'progress.key': { $exists: false } },
          { 'progress.key': ChatResponseType.NEED_COMPANY },
        ],
        'progress.steps': { $ne: -1 },
      }),
      {
        $set: { 'progress.key': ChatResponseType.NEED_COMPANY },
        $addToSet: { 'progress.steps': -1 },
        $inc: { amountLeft: -1 },
      },
      expect.objectContaining({ new: true }),
    );
  });

  it.each([
    [undefined, ChatEmotion.JOY],
    [ChatResponseType.YES, undefined],
    ['InvalidResponse', ChatEmotion.JOY],
    [ChatResponseType.YES, 99],
  ])(
    'does not progress for invalid response or emotion values',
    async (responseType, emotion) => {
      const { model, service } = createService();

      const [result, errors] = await service.updatePlayWithEmotionsTask(
        'player-1',
        'clan-1',
        responseType as any,
        emotion as any,
      );

      expect(result).toBeNull();
      expect(errors).toBeNull();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    },
  );

  it('does not progress or notify when the emotion is already recorded', async () => {
    const session = {
      startTransaction: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      commitTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    const { progressService, service } = createService();
    (service as any).connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    const [result, errors] = await service.handleDailyTaskEvent({
      playerId: 'player-1',
      serverTaskName: ServerTaskName.PLAY_WITH_EMOTIONS,
      clanId: 'clan-1',
      responseType: ChatResponseType.YES,
      emotion: ChatEmotion.JOY,
    });

    expect(result).toBeNull();
    expect(errors).toBeNull();
    expect(progressService.handleProgress).not.toHaveBeenCalled();
  });

  it('completes on the sixth emotion and clears progress on replacement', async () => {
    const updatedTask = {
      _id: 'task-1',
      clan_id: 'clan-1',
      amountLeft: 0,
      progress: {
        key: ChatResponseType.YES,
        steps: [-1, 0, 1, 2, 3, 4],
      },
    };
    const { basicService, service } = createService(updatedTask);

    const [result, errors] = await service.updatePlayWithEmotionsTask(
      'player-1',
      'clan-1',
      ChatResponseType.YES,
      ChatEmotion.LOVE,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({ status: 'completed', currentAmountLeft: 0 });
    expect(basicService.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $set: expect.objectContaining({ amountLeft: 2, progress: {} }),
      }),
      expect.anything(),
    );
  });
});
