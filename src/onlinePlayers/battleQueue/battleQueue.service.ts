import { Injectable } from '@nestjs/common';
import { IServiceReturn } from '../../common/service/basicService/IService';
import OnlinePlayer from '../payload/OnlinePlayer';
import { BattleWaitStatus } from '../payload/additionalTypes/BattleWaitStatus';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { RedisService } from '../../common/service/redis/redis.service';
import { CacheKeys } from '../../common/service/redis/cacheKeys.enum';

@Injectable()
export class BattleQueueService {
  public constructor(private readonly redisService: RedisService) {}

  /**
   * Max number the queue number can become
   * @private
   */
  private readonly queueNumberMax = 9999;

  /**
   * Gets a queue number for a player.
   *
   * Each time a player gets a new queue number, the queue number is increased by one until it becomes its max value.
   * Then the number will be set to its max value, it will be reset and will be equal to zero again.
   * Notice that if the player already in the queue, the number will not be updated
   *
   * @param player player for which the number is requested
   *
   * @returns queue number for an online player
   */
  async getPlayerQueueNumber(
    player: OnlinePlayer<any> | null,
  ): Promise<IServiceReturn<number>> {
    if (player?.additional?.queueNumber != null) {
      const existingQueueNumber = (player as OnlinePlayer<BattleWaitStatus>)
        .additional.queueNumber;
      return [existingQueueNumber, null];
    }

    const playerQueueNumber = await this.getNextQueueNumber();
    await this.increaseQueueNumber();

    return [playerQueueNumber, null];
  }

  /**
   * Sorts online players based on their queueNumber considering wrap-around after queue number is reset
   *
   * Notice that all players that does not have a queue number, will be excluded from queue and not retuned.
   *
   * @param players players with queueNumber
   *
   * @returns players in order number or ServiceError NOT_FOUND if:
   * - Empty array is provided
   * - No players have a queue number
   */
  sortPlayersByQueueNumber(
    players: OnlinePlayer<BattleWaitStatus>[],
  ): IServiceReturn<OnlinePlayer<BattleWaitStatus>[]> {
    const [validPlayers, filterErrors] =
      this.filterInvalidPlayersInQueue(players);

    if (filterErrors) return [null, filterErrors];

    const queueNumbers = validPlayers.map((p) => p.additional.queueNumber);

    const queueMax = this.queueNumberMax + 1;
    let oldestQN = queueNumbers[0];

    for (const currentNumber of queueNumbers) {
      const diffRefToCurr = (currentNumber - oldestQN + queueMax) % queueMax;
      const diffCurrToRef = (oldestQN - currentNumber + queueMax) % queueMax;

      if (diffCurrToRef < diffRefToCurr) oldestQN = currentNumber;
    }

    const sortedPlayers = validPlayers
      .slice()
      .sort((playerLeft, playerRight) => {
        const aQN = playerLeft.additional.queueNumber;
        const bQN = playerRight.additional.queueNumber;

        const normA = (aQN - oldestQN + queueMax) % queueMax;
        const normB = (bQN - oldestQN + queueMax) % queueMax;

        return normA - normB;
      });

    return [sortedPlayers, null];
  }

  /**
   * Gets next queue number from Redis.
   *
   * Notice that if number does not exist = not set, it will be set to zero.
   *
   * Notice that the method does not change the value in Redis, it only returns the current value
   *
   * @private
   * @returns next queue number from Redis
   */
  private async getNextQueueNumber() {
    const queueNumberStr = await this.redisService.get(
      CacheKeys.NEXT_QUEUE_NUMBER,
    );
    if (queueNumberStr) return Number.parseInt(queueNumberStr);

    await this.redisService.set(CacheKeys.NEXT_QUEUE_NUMBER, '0');
    return 0;
  }

  /**
   * Increases next queue number in Redis.
   *
   * Notice that if the number is more than max queue number it will be reset to zero
   *
   * @private
   */
  private async increaseQueueNumber() {
    let queueNumber = await this.getNextQueueNumber();

    queueNumber++;
    if (queueNumber > this.queueNumberMax) queueNumber = 0;

    await this.redisService.set(CacheKeys.NEXT_QUEUE_NUMBER, `${queueNumber}`);
  }

  /**
   * Filters players that does not have an order number
   *
   * @param players players to filter
   * @private
   * @returns only players that have the order number or ServiceError NOT_FOUND if there are no valid players
   */
  private filterInvalidPlayersInQueue(
    players: OnlinePlayer<BattleWaitStatus>[],
  ): IServiceReturn<OnlinePlayer<BattleWaitStatus>[]> {
    if (players.length === 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'No online players in battle queue',
          }),
        ],
      ];

    const validPlayers = players.filter(
      (player) => player.additional?.queueNumber != null,
    );
    if (validPlayers.length === 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'No online players with queue number found',
          }),
        ],
      ];
    return [validPlayers, null];
  }
}
