import { MongooseError } from 'mongoose';
import { points } from './points';
import { PlayerEvent } from './enum/PlayerEvent.enum';
import { PlayerService } from '../../player/player.service';
import { Injectable } from '@nestjs/common';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from '../../common/service/basicService/IService';

@Injectable()
export class PlayerRewarder {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * Rewards specified player for an event happen
   * @param player_id player _id to reward
   * @param playerEvent happen event
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  async rewardForPlayerEvent(
    player_id: string,
    playerEvent: PlayerEvent,
  ): Promise<[boolean, ServiceError[] | MongooseError]> {
    const pointAmount = points[playerEvent];
    if (pointAmount === undefined)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.WRONG_ENUM,
            field: 'playerEvent',
            value: playerEvent,
            message: 'This playerEvent does not exist',
          }),
        ],
      ];

    return this.increasePlayerPoints(player_id, pointAmount);
  }

  /**
   * Rewards specified player for a completed player task
   * @param player_id player _id to reward
   * @param points amount of points to reward
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  async rewardForPlayerTask(
    player_id: string,
    points: number,
  ): Promise<IServiceReturn<true>> {
    if (points < 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.LESS_THAN_MIN,
            field: 'points',
            value: points,
            message: 'Points amount can not be less than 0',
          }),
        ],
      ];

    return this.increasePlayerPoints(player_id, points);
  }

  /**
   * Increases specified player points amount
   * @param player_id player _id
   * @param points amount of points to increase
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  private async increasePlayerPoints(
    player_id: string,
    points: number,
  ): Promise<IServiceReturn<true>> {
    const result = await this.playerService.updateOneById({
      _id: player_id,
      $inc: { points },
    });

    if (result instanceof MongooseError) throw result;

    return [true, null];
  }
}
