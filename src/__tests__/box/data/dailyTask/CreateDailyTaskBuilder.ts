import {TaskName} from "../../../../dailyTasks/enum/taskName.enum";
import {CreateDailyTask} from "../../../../box/dailyTask/payloads/CreateDailyTask";

export default class CreateDailyTaskBuilder {
    private readonly base: Partial<CreateDailyTask> = {
        type: TaskName.PLAY_BATTLE,
        title: 'Default Task Title',
        amount: 1,
        points: 10,
        coins: 5,
        timeLimitMinutes: 60
    };

    build(): CreateDailyTask {
        return {...this.base} as CreateDailyTask;
    }

    setType(type: TaskName) {
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
