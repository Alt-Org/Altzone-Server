import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import DailyTaskNotifier from '../../dailyTasks/dailyTask.notifier';
import { DailyTaskQueue } from '../../dailyTasks/dailyTask.queue';
import { TaskGeneratorService } from '../../dailyTasks/taskGenerator.service';
import { DailyTaskProgressService } from '../../dailyTasks/dailyTaskProgress.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { ChatEmotion } from '../../chat/enum/chatEmotion.enum';
import { ChatResponseType } from '../../chat/enum/chatResponseType.enum';
import { PlayerRewarder } from '../../rewarder/playerRewarder/playerRewarder.service';

describe('MESSAGE_YOUR_CLAN Daily Task', () => {
  let service: DailyTasksService;
  let mockModel: any;
  let commitTransaction: jest.Mock;
  let notifyProgress: jest.Mock;

  beforeEach(async () => {
    commitTransaction = jest.fn();
    notifyProgress = jest.fn();
    mockModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyTasksService,
        {
          provide: getModelToken(DailyTask.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              startTransaction: jest.fn(),
              commitTransaction,
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
              inTransaction: jest.fn().mockReturnValue(true),
            }),
          },
        },
        {
          provide: DailyTaskNotifier,
          useValue: { taskReceived: jest.fn(), taskCompleted: jest.fn() },
        },
        {
          provide: DailyTaskQueue,
          useValue: { addDailyTask: jest.fn() },
        },
        {
          provide: TaskGeneratorService,
          useValue: {
            createTaskRandomValues: jest.fn().mockReturnValue({ amount: 5 }),
          },
        },
        {
          provide: DailyTaskProgressService,
          useValue: {
            handleProgress: jest.fn().mockResolvedValue([true, null]),
            notifyProgress,
          },
        },
        {
          provide: PlayerRewarder,
          useValue: { deductPlayerPoints: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DailyTasksService>(DailyTasksService);
  });

  describe('Validation & Guards', () => {
    it('returns [null, null] when clanId is missing', async () => {
      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeNull();
    });

    it('returns [null, null] for unsupported response types', async () => {
      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'clan-1',
        responseType: 'INVALID_RESPONSE_TYPE' as any,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeNull();
    });

    it('returns [null, null] for invalid emotion values', async () => {
      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: 9999 as any,
      });

      expect(res).toBeNull();
      expect(err).toBeNull();
    });
  });

  describe('Task Progress & Clan Ownership', () => {
    it('successfully progresses task when clanId, responseType, and emotion are valid', async () => {
      const mockTask = {
        _id: 'task-1',
        clan_id: 'clan-1',
        player_id: 'player-1',
        amountLeft: 2,
        type: ServerTaskName.MESSAGE_YOUR_CLAN,
      };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockTask, amountLeft: 1 }),
      });

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
        needsClanReward: true,
      });

      expect(err).toBeNull();
      expect(res).toBeDefined();
      expect(res?.status).toBe('advanced');
      expect(res?.needsClanReward).toBe(true);
      expect(commitTransaction).toHaveBeenCalled();
      expect(notifyProgress).toHaveBeenCalledWith(res);
      expect(commitTransaction.mock.invocationCallOrder[0]).toBeLessThan(
        notifyProgress.mock.invocationCallOrder[0],
      );
    });

    it('successfully completes task when amountLeft reaches 0', async () => {
      const mockTask = {
        _id: 'task-1',
        clan_id: 'clan-1',
        player_id: 'player-1',
        amountLeft: 1,
        type: ServerTaskName.MESSAGE_YOUR_CLAN,
      };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockTask, amountLeft: 0 }),
      });
      jest.spyOn(service, 'deleteTask').mockResolvedValue([true as any, null]);

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
        needsClanReward: true,
      });

      expect(err).toBeNull();
      expect(res).toBeDefined();
      expect(res?.status).toBe('completed');
      expect(res?.currentAmountLeft).toBe(0);
      expect(service.deleteTask).toHaveBeenCalledWith(
        'task-1',
        'clan-1',
        'player-1',
        expect.anything(),
      );
    });

    it('does not progress a task that is missing or has the wrong type', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'wrong-clan',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeNull();
    });
  });

  describe('Failed Persistence', () => {
    it('returns database error when update fails', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Write failed')),
      });

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.MESSAGE_YOUR_CLAN,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeDefined();
    });
  });
});
