import { EventName, EventPayload } from './event.types';

/**
 * Represents an event happen in the game and which should be handled by the API.
 *
 * Example of such event can be the player winning a game and therefore expected to get a reward for it.
 */
export default class GameEvent<T extends EventName> {
  constructor(eventName: T, info: EventPayload<T>) {
    this.eventName = eventName;
    this.info = info;
  }

  /**
   * Name of the event happen
   */
  public readonly eventName: EventName;

  /**
   * Additional information about the event that can be helpful for handling the event.
   *
   * Notice that the type of it is defined by the GameEventType, so different event may have different info fields
   */
  public readonly info: EventPayload<T>;
}

export type GameEventPayload<T extends EventName> = {
  eventName: T;
  info: EventPayload<T>;
};
