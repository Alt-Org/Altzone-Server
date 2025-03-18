import GameEvent from "../../../../gameEventsEmitter/gameEvent";
import {EventName} from "../../../../gameEventsEmitter/event.types";

export default class GameEventBuilder {
    private readonly base = {
        eventName: 'game.winBattle',
        info: {playerId: "", gameId: "", pointsEarned: 0},
    };

    build(): GameEvent<'game.winBattle'> {
        return new GameEvent(this.base.eventName as any, this.base.info as any);
    }

    setEventName(eventName: EventName) {
        this.base.eventName = eventName;
        return this;
    }

    setInfo(info: any) {
        this.base.info = info;
        return this;
    }
}
