import {UpdatePredefinedDailyTaskDto} from "../../../../box/dailyTask/dto/updatePredefinedDailyTask.dto";
import {ServerTaskName} from "../../../../dailyTasks/enum/serverTaskName.enum";

export default class UpdatePredefinedDailyTaskDtoBuilder {
    private readonly base: Partial<UpdatePredefinedDailyTaskDto> = {
        _id: undefined,
        type: undefined,
        title: undefined,
        amount: undefined,
        points: undefined,
        coins: undefined,
        timeLimitMinutes: undefined,
    };

    build(): UpdatePredefinedDailyTaskDto {
        return { ...this.base } as UpdatePredefinedDailyTaskDto;
    }

    setId(id: string) {
        this.base._id = id;
        return this;
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
