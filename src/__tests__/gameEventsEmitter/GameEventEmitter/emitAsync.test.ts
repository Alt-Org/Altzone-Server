import GameEventEmitter from "../../../gameEventsEmitter/gameEventEmitter";
import {EventEmitter2} from "@nestjs/event-emitter";
import GameEventsEmitterModule from "../modules/gameEventsEmitter.module";
import GameEventsEmitterBuilderFactory from "../data/gameEventsEmitterBuilderFactory";

describe('GameEventEmitter.emitAsync() test suite', () => {
    let gameEventEmitter: GameEventEmitter;
    let eventEmitter: EventEmitter2;

    const eventBuilder = GameEventsEmitterBuilderFactory.getBuilder('GameEvent');
    const sentEvent = eventBuilder.build()

    beforeEach(async () => {
        gameEventEmitter = await GameEventsEmitterModule.getGameEventEmitter();
        eventEmitter = await GameEventsEmitterModule.getEventEmitter2();
    });

    afterEach(() => {
        eventEmitter.removeAllListeners();
    });

    it('Should emit a sync event and be received by a listener', (done) => {
        eventEmitter.on(sentEvent.eventName, (eventData) => {
            expect(eventData).toEqual(sentEvent);
            done();
        });

        gameEventEmitter.emitAsync(sentEvent.eventName, sentEvent.info);
    });
});
