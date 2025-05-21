import { Injectable } from '@nestjs/common';
import { IServiceReturn } from '../../common/service/basicService/IService';
import OnlinePlayer from '../payload/OnlinePlayer';
import { BattleWaitStatus } from '../payload/additionalTypes/BattleWaitStatus';

@Injectable()
export class BattleQueueService {
  public constructor() {}

  /**
   * Max number the queue number can become
   * @private
   */
  private readonly queueNumberMax = 9999;

  /**
   * Auto-incremented positive integer number, which is used to determine queue position of a player
   * @private
   */
  private nextQueueNumber = 0;

  /**
   * Gets a queue number for a player.
   *
   * Each time a player gets a new queue number, the queue number is increased by one until it becomes its max value.
   * Then the number will be set to its max value, it will be reset and will be equal to zero again.
   * Notice that if the player already in the queue, the number will not be updated
   *
   * @param player player for which the number is requested
   */
  async getPlayerQueueNumber(
    player: OnlinePlayer<any> | null,
  ): Promise<IServiceReturn<number>> {
    if (player && player.additional?.queueNumber != null) {
      const existingQueueNumber = (player as OnlinePlayer<BattleWaitStatus>)
        .additional.queueNumber;
      return [existingQueueNumber, null];
    }

    const playerQueueNumber = this.nextQueueNumber;
    this.nextQueueNumber++;
    if (this.nextQueueNumber > this.queueNumberMax) this.nextQueueNumber = 0;

    return [playerQueueNumber, null];
  }
}
