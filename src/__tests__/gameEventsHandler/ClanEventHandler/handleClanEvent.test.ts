import { ClanEventHandler } from '../../../gameEventsHandler/clanEventHandler';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import { DailyTasksService } from '../../../dailyTasks/dailyTasks.service';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import DailyTaskBuilderFactory from '../../dailyTasks/data/dailyTaskBuilderFactory';
import { DailyTaskDto } from '../../../dailyTasks/dto/dailyTask.dto';
import { ObjectId } from 'mongodb';

describe('ClanEventHandler.handleClanEvent() test suite', () => {
  let clanEventHandler: ClanEventHandler;
  let tasksService: DailyTasksService;
  let clanRewarder: ClanRewarder;
  let playerRewarder: PlayerRewarder;

  const taskDtoBuilder = DailyTaskBuilderFactory.getBuilder('DailyTaskDto');
  let taskDto: DailyTaskDto;

  beforeEach(async () => {
    jest.resetAllMocks();

    taskDto = taskDtoBuilder.setAmountLeft(0).build();

    clanEventHandler = await GameEventsHandlerModule.getClanEventHandler();
    tasksService = await GameEventsHandlerModule.getDailyTasksService();
    clanRewarder = await GameEventsHandlerModule.getClanRewarder();
    playerRewarder = await GameEventsHandlerModule.getPlayerRewarder();

    jest.spyOn(tasksService, 'updateTask').mockResolvedValue(taskDto);
    jest.spyOn(clanRewarder, 'rewardClanForPlayerTask').mockImplementation();
    jest.spyOn(playerRewarder, 'rewardForPlayerTask').mockImplementation();
  });

  it('Should return with true and execute all of the dependent methods if inputs are fine', async () => {
    const [result, error] = await clanEventHandler.handlePlayerTask(
      new ObjectId().toString(),
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(tasksService.updateTask).toHaveBeenCalledTimes(1);
    expect(clanRewarder.rewardClanForPlayerTask).toHaveBeenCalledTimes(1);
    expect(playerRewarder.rewardForPlayerTask).toHaveBeenCalledTimes(1);
  });

  it('Should return with true ', async () => {
    taskDto = taskDtoBuilder.setAmountLeft(1).build();
    jest.spyOn(tasksService, 'updateTask').mockResolvedValue(taskDto);

    const [result, error] = await clanEventHandler.handlePlayerTask(
      new ObjectId().toString(),
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(tasksService.updateTask).toHaveBeenCalledTimes(1);
    expect(clanRewarder.rewardClanForPlayerTask).toHaveBeenCalledTimes(0);
    expect(playerRewarder.rewardForPlayerTask).toHaveBeenCalledTimes(0);
  });

  it('Should return with true but do nothing if the tasksService.updateTask threw an exception', async () => {
    jest.spyOn(tasksService, 'updateTask').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const [result, error] = await clanEventHandler.handlePlayerTask(
      new ObjectId().toString(),
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(tasksService.updateTask).toHaveBeenCalledTimes(1);
    expect(clanRewarder.rewardClanForPlayerTask).toHaveBeenCalledTimes(0);
    expect(playerRewarder.rewardForPlayerTask).toHaveBeenCalledTimes(0);
  });
});
