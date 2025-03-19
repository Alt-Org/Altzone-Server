import {OnGameEvent} from "../gameEventsEmitter/onGameEvent";
import {GameEventPayload} from "../gameEventsEmitter/gameEvent";

export default class UiDailyTaskHandler {
    @OnGameEvent('dailyTask.updateUIBasicTask', {async: true})
    async handleUIBasicTaskUpdate(payload: GameEventPayload<'dailyTask.updateUIBasicTask'>){
        console.log('received');
        console.log(payload);
    }
}
