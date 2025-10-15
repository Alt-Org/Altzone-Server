import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';
import { TaskTitle } from '../../../../dailyTasks/type/taskTitle.type';
import { ObjectId } from 'mongodb';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import { DailyTaskDto } from '../../../../dailyTasks/dto/dailyTask.dto';

export default class DailyTaskDtoBuilder {
  private readonly base: Partial<DailyTaskDto> = {
    _id: undefined,
    clan_id: null,
    player_id: null,
    title: { fi: 'Default task title' },
    type: ServerTaskName.PLAY_BATTLE,
    startedAt: null,
    points: 10,
    coins: 5,
    amount: 1,
    amountLeft: 1,
    timeLimitMinutes: 60,
  };

  build(): DailyTaskDto {
    return { ...this.base } as DailyTaskDto;
  }

  setId(id: string | ObjectId) {
    this.base._id = id as any;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.base.clan_id = clanId as any;
    return this;
  }

  setPlayerId(playerId: string | ObjectId | null) {
    this.base.player_id = playerId as any;
    return this;
  }

  setTitle(title: TaskTitle) {
    this.base.title = title;
    return this;
  }

  setType(type: ServerTaskName | UITaskName) {
    this.base.type = type;
    return this;
  }

  setStartedAt(startedAt: Date | null) {
    this.base.startedAt = startedAt;
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

  setAmount(amount: number) {
    this.base.amount = amount;
    return this;
  }

  setAmountLeft(amountLeft: number) {
    this.base.amountLeft = amountLeft;
    return this;
  }

  setTimeLimitMinutes(timeLimitMinutes: number) {
    this.base.timeLimitMinutes = timeLimitMinutes;
    return this;
  }
}
