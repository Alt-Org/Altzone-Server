import GameEventsEmitterCommonModule from './gameEventsEmitterCommon';
import GameEventEmitter from '../../../gameEventsEmitter/gameEventEmitter';
import { EventEmitter2 } from '@nestjs/event-emitter';

export default class GameEventsEmitterModule {
  private constructor() {}

  static async getGameEventEmitter() {
    const module = await GameEventsEmitterCommonModule.getModule();
    return await module.resolve(GameEventEmitter);
  }

  static async getEventEmitter2() {
    const module = await GameEventsEmitterCommonModule.getModule();
    return await module.resolve(EventEmitter2);
  }
}
