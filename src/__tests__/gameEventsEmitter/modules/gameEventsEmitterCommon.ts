import {Test, TestingModule} from '@nestjs/testing';
import {EventEmitterModule} from "@nestjs/event-emitter";
import GameEventEmitter from "../../../gameEventsEmitter/gameEventEmitter";


export default class GameEventsEmitterCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!GameEventsEmitterCommonModule.module)
            GameEventsEmitterCommonModule.module = await Test.createTestingModule({
                imports: [
                    EventEmitterModule.forRoot({
                        wildcard: true,
                        delimiter: '.',
                        newListener: false,
                        removeListener: false,
                        maxListeners: 10,
                        verboseMemoryLeak: true,
                        ignoreErrors: false
                    }),
                ],

                providers: [GameEventEmitter]
            }).compile();

        return GameEventsEmitterCommonModule.module;
    }
}