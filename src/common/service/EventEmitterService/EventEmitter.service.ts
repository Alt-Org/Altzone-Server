import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 Service for emitt Server Events
 */
@Injectable()
export default class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit a new daily task event
   * @param player_Id id of the player
   * @param message free text
   * @param serverTaskName  name of the server task
   */
  public async EmitNewDailyTaskEvent(player_Id, message, serverTaskName) {
    await this.eventEmitter.emitAsync('newDailyTaskEvent', {
      playerId: player_Id,
      message,
      serverTaskName: serverTaskName,
    });
  }
}
