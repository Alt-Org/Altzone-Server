import {EventName} from "./event.types";
import {OnEvent} from "@nestjs/event-emitter";
import {OnEventOptions} from "@nestjs/event-emitter/dist/interfaces";

/**
 * Listens to the specified game events and provides a payload of this event to the decorated method.
 *
 * Notice that it is just a typed wrapper for the Nest's OnEvent decorator from event-emitter package.
 *
 * Notice that if you are using emitAsync() method, set the option async to true here.
 *
 * @param eventName name of the event to listen
 * @param options object with options to forward to OnEvent decorator
 */
export function OnGameEvent<T extends EventName>(eventName: T, options?: OnEventOptions) {
    return OnEvent(eventName, options);
}
