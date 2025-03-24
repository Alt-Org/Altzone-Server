import { Module } from '@nestjs/common';
import GameEventEmitter from './gameEventEmitter';
import { EventEmitterModule } from '@nestjs/event-emitter';

/**
 * Module for emitting events.
 *
 * Please do not add any imports to it, since it is meant to be used in any other module
 */
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],

  providers: [GameEventEmitter],

  exports: [GameEventEmitter],
})
export class GameEventsEmitterModule {}
