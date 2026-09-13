import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';

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
  public async EmitNewDailyTaskEvent(
    player_Id: string,
    serverTaskName: ServerTaskName,
    needsClanReward: boolean = true,
  ) {
    await this.eventEmitter.emitAsync('newDailyTaskEvent', {
      playerId: player_Id,
      serverTaskName,
      needsClanReward,
    });
  }

  /**
   * Emit a clan-level daily task event. Clan tasks are progressed without
   * requiring a player reservation and do not grant an individual reward.
   */
  public async EmitNewClanDailyTaskEvent(
    clanId: string,
    completedByPlayerId: string,
    serverTaskName: ServerTaskName,
  ) {
    await this.eventEmitter.emitAsync('newClanDailyTaskEvent', {
      clanId,
      completedByPlayerId,
      serverTaskName,
    });
  }

  /**
   * Emit a player created event
   *  @param playerId of the created player
   */
  public async EmitPlayerCreatedEvent(playerId: string) {
    this.eventEmitter.emit('player.created', playerId);
  }
}
