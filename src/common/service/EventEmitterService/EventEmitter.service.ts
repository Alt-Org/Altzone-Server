import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { ChatEmotion } from '../../../chat/enum/chatEmotion.enum';
import { ChatResponseType } from '../../../chat/enum/chatResponseType.enum';
import { StrongerSoldierStep } from '../../../dailyTasks/enum/strongerSoldierStep.enum';

/**
 Service for emitt Server Events
 */
@Injectable()
export default class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit a new daily task event
   * @param player_Id id of the player
   * @param serverTaskName  name of the server task
   * @param needsClanReward whether completion should also reward the clan
   * @param payload optional task-specific event payload
   */
  public async EmitNewDailyTaskEvent(
    player_Id: string,
    serverTaskName: ServerTaskName,
    needsClanReward: boolean = true,
    payload?: {
      clanId?: string;
      responseType?: ChatResponseType;
      emotion?: ChatEmotion;
      strongerSoldierStep?: StrongerSoldierStep;
    },
  ) {
    await this.eventEmitter.emitAsync('newDailyTaskEvent', {
      playerId: player_Id,
      serverTaskName,
      needsClanReward,
      ...payload,
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
