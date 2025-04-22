import { PredefinedDailyTask } from '../../../../box/dailyTask/predefinedDailyTask.schema';
import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';
import { ObjectId } from 'mongodb';

export default class PredefinedDailyTaskBuilder {
  private readonly base: Partial<PredefinedDailyTask> = {
    type: ServerTaskName.PLAY_BATTLE,
    title: 'Default Predefined Task',
    amount: 1,
    points: 10,
    coins: 5,
    timeLimitMinutes: 60,
    _id: undefined,
  };

  build(): PredefinedDailyTask {
    return { ...this.base } as PredefinedDailyTask;
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

  setId(id: ObjectId | string) {
    if (typeof id === 'string') this.base._id = new ObjectId(id);
    else this.base._id = id;
    return this;
  }
}
