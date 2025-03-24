import GameEvent from '../../../../gameEventsEmitter/gameEvent';
import {
  EventName,
  EventPayload,
} from '../../../../gameEventsEmitter/event.types';

export default class GameEventBuilder<T extends EventName> {
  private eventName: EventName = 'game.winBattle';
  private info = {};

  build(): GameEvent<T> {
    return new GameEvent<any>(this.eventName, this.info);
  }

  setEventName(eventName: T) {
    this.eventName = eventName;
    return this;
  }

  setInfo(info: EventPayload<T>) {
    this.info = info as any;
    return this;
  }
}
