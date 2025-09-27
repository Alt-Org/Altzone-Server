import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { WsMessageBodyDto } from '../../../chat/dto/wsMessageBody.dto';

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
  public async EmitNewDailyTaskEvent(player_Id: string, message: WsMessageBodyDto, serverTaskName: ServerTaskName) {
    await this.eventEmitter.emitAsync('newDailyTaskEvent', {
      playerId: player_Id,
      message, //TODO: need to consider if message is needed here at all
      serverTaskName,
    });
  }
}
