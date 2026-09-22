import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import DailyTaskNotifier from '../../dailyTasks/dailyTask.notifier';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { ChatEmotion } from '../../chat/enum/chatEmotion.enum';
import { ChatResponseType } from '../../chat/enum/chatResponseType.enum';

describe('FORM_AN_INNER_CONNECTION Daily Task', () => {
  let service: DailyTasksService;
  let mockModel: any;

  beforeEach(async () => {
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
              commitTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
            }),
          },
        },
        {
          provide: DailyTaskNotifier,
          useValue: { taskReceived: jest.fn(), taskCompleted: jest.fn() },
        },
        {
          provide: 'DailyTaskQueue',
          useValue: { addDailyTask: jest.fn() },
        },
        {
          provide: 'TaskGeneratorService',
          useValue: { createTaskRandomValues: jest.fn() },
        },
        {
          provide: 'DailyTaskProgressService',
          useValue: { handleProgress: jest.fn().mockResolvedValue([true, null]) },
        },
      ],
    }).compile();

    service = module.get<DailyTasksService>(DailyTasksService);
  });

  describe('Validation & Guards', () => {
    it('returns [null, null] when clanId is missing', async () => {
      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeNull();
    });

    it('returns [null, null] for unsupported response types', async () => {
      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
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
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
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
        type: ServerTaskName.FORM_AN_INNER_CONNECTION,
      };

      jest.spyOn(service['basicService'], 'readOne').mockResolvedValue([mockTask as any, null]);
      jest.spyOn(service['basicService'], 'updateOne').mockResolvedValue([true, null]);

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
        needsClanReward: true,
      });

      expect(err).toBeNull();
      expect(res).toBeDefined();
      expect(res?.status).toBe('advanced');
      expect(res?.needsClanReward).toBe(true);
    });

    it('successfully completes task when amountLeft reaches 0', async () => {
      const mockTask = {
        _id: 'task-1',
        clan_id: 'clan-1',
        player_id: 'player-1',
        amountLeft: 1,
        type: ServerTaskName.FORM_AN_INNER_CONNECTION,
      };

      jest.spyOn(service['basicService'], 'readOne').mockResolvedValue([mockTask as any, null]);
      jest.spyOn(service, 'deleteTask').mockResolvedValue([true as any, null]);

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
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

    it('returns error when task is not found or owned by another clan', async () => {
      jest.spyOn(service['basicService'], 'readOne').mockResolvedValue([
        null,
        [{ reason: 'NOT_FOUND', message: 'Task not found' }] as any,
      ]);

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
        clanId: 'wrong-clan',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeDefined();
    });
  });

  describe('Failed Persistence', () => {
    it('returns database error when update fails', async () => {
      const mockTask = {
        _id: 'task-1',
        clan_id: 'clan-1',
        player_id: 'player-1',
        amountLeft: 1,
        type: ServerTaskName.FORM_AN_INNER_CONNECTION,
      };

      jest.spyOn(service['basicService'], 'readOne').mockResolvedValue([mockTask as any, null]);
      jest.spyOn(service['basicService'], 'updateOne').mockResolvedValue([
        null,
        [{ reason: 'DATABASE_ERROR', message: 'Write failed' }] as any,
      ]);

      const [res, err] = await service.handleDailyTaskEvent({
        playerId: 'player-1',
        serverTaskName: ServerTaskName.FORM_AN_INNER_CONNECTION,
        clanId: 'clan-1',
        responseType: ChatResponseType.YES,
        emotion: ChatEmotion.JOY,
      });

      expect(res).toBeNull();
      expect(err).toBeDefined();
    });
  });
});