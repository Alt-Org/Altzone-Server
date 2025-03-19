import UIBasicDailyTask from "./payloads/UIBasicDailyTask";
import CreatedClan from "./payloads/CreatedClan";

/**
 * Record containing all possible event resources with their supported actions.
 *
 * Resource of an event represents subject/object of the event, such as daily task
 *
 * Action of an event represents what happen, such as start
 */
const EventNamesMap = {
    game: ['winBattle', 'playBattle'] as const,
    message: ['send'] as const,
    voting: ['sendVote', 'start'] as const,
    diamond: ['collect'] as const,
    character: ['startBattle'] as const,
    dailyTask: ['updateUIBasicTask'] as const,
    clan: ['create'] as const
} as const;

/**
 * Defines a payload for each event name
 */
const EventsPayloadMap = {
    "game.winBattle": {},
    "game.playBattle": {},
    "message.send": {},
    "voting.sendVote": {},
    "voting.start": {},
    "diamond.collect": {},
    "character.startBattle": {},
    "dailyTask.updateUIBasicTask": {} as UIBasicDailyTask,
    "clan.create": {} as CreatedClan,
} as const;

/**
 * The event name consists of two pieces resource and action. For example: "player.winGame" or "dailyTask.done".
 *
 * It determines a unique name for an event.
 */
export type EventName = {
    [K in keyof typeof EventNamesMap]: `${K}.${(typeof EventNamesMap)[K][number]}`
}[keyof typeof EventNamesMap];


/**
 * Payload of an event, which contains some data of the event
 */
export type EventPayload<T extends EventName> = T extends keyof typeof EventsPayloadMap ? typeof EventsPayloadMap[T] : never;
