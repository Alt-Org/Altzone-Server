import {Injectable} from "@nestjs/common";
import {EventName, EventPayload} from "./event.types";
import {EventEmitter2} from "@nestjs/event-emitter";
import GameEvent from "./gameEvent";

/**
 * Class for emitting happen game events.
 *
 * Uses Nest's EventEmitter under the hood and adds type safety
 */
@Injectable()
export default class GameEventEmitter {
    constructor(private readonly eventEmitter: EventEmitter2) {
    }

    /**
     * Emit happen game event, sync
     *
     * The event handler will be run synchronously
     *
     * @param eventName name of the event
     * @param payload information of the event
     */
    emit<T extends EventName>(eventName: T & EventName, payload: EventPayload<T>): void {
        const gameEvent = new GameEvent(eventName, payload);
        this.eventEmitter.emit(eventName, gameEvent);
    }

    /**
     * Emit happen game event.
     *
     * The event handler will be run in the background, notice that the handler OnGameEvent should have async option set to true
     *
     * @param eventName name of the event
     * @param payload information of the event
     */
    async emitAsync<T extends EventName>(eventName: T & EventName, payload: EventPayload<T>): Promise<void> {
        const gameEvent = new GameEvent(eventName, payload);
        await this.eventEmitter.emitAsync(eventName, gameEvent);
    }
}
