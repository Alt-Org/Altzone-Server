import { CreatePredefinedDailyTaskDto } from '../../../../box/dailyTask/dto/createPredefinedDailyTask.dto';
import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';

export default class CreatePredefinedDailyTaskDtoBuilder {
  private readonly base: Partial<CreatePredefinedDailyTaskDto> = {
    type: ServerTaskName.PLAY_BATTLE,
    title: 'Default Predefined Task Title',
    amount: 1,
    points: 10,
    coins: 5,
    timeLimitMinutes: 60,
  };

  build(): CreatePredefinedDailyTaskDto {
    return { ...this.base } as CreatePredefinedDailyTaskDto;
  }

  setType(type: ServerTaskName) {
    this.base.type = type;
    return this;
  }

  setTitle(title: string) {
    this.base.title = title;
    return this;
  }

  setAmount(amount: number) {
    this.base.amount = amount;
    return this;
  }

  setPoints(points: number) {
    this.base.points = points;
    return this;
  }

  setCoins(coins: number) {
    this.base.coins = coins;
    return this;
  }

  setTimeLimitMinutes(timeLimitMinutes: number) {
    this.base.timeLimitMinutes = timeLimitMinutes;
    return this;
  }
}
