/**
 * Object containing all possible event resources with their supported actions
 */
export const EventActions = {
    game: ['winBattle', 'playBattle'] as const,
    message: ['send'] as const,
    voting: ['sendVote', 'start'] as const,
    diamond: ['collect'] as const,
    character: ['startBattle'] as const
} as const;

/**
 * Resource of an event, which represents subject/object of the event, such as daily task
 */
export type EventResource = keyof typeof EventActions;
/**
 * Action of an event, which represents what happen, such as completed
 */
export type EventAction<Resource extends EventResource> = (typeof EventActions)[Resource][number];

/**
 * The event name consists of two pieces resource and action. For example: "player.winGame" or "dailyTask.done".
 *
 * It determines a unique name for an event.
 */
export type EventName = `${EventResource}.${EventAction<EventResource>}`;

/**
 * Helper class to build a correct event name.
 */
export default class EventNameBuilder {
    private constructor() {
    }

    /**
     * Sets the resource of an event
     * @param resource resource to set
     * @returns next stage to set an action
     */
    static setResource<Resource extends EventResource>(resource: Resource) {
        return new EventNameBuilderWithResource<Resource>(resource);
    }
}

/**
 * Stage for setting event action
 */
class EventNameBuilderWithResource<Resource extends EventResource> {
    constructor(private readonly resource: Resource) {
    }

    /**
     * Sets the action of an event
     * @param action action to set
     * @returns next stage to build the event name
     */
    setAction<Action extends EventAction<Resource>>(action: Action) {
        return new EventNameBuilderWithAction<Resource, Action>(this.resource, action);
    }
}

/**
 * Stage to build correct event name
 */
class EventNameBuilderWithAction<Resource extends EventResource, Action extends EventAction<Resource>> {
    constructor(private readonly resource: Resource, private readonly action: Action) {
    }

    /**
     * Builds the event name
     * @returns built event name
     */
    build(): EventName {
        return `${this.resource}.${this.action}`;
    }
}
