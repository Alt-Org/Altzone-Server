import { Model, MongooseError } from 'mongoose';
import { points } from './points';
import { PlayerEvent } from './enum/PlayerEvent.enum';
import { Injectable } from '@nestjs/common';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { PlayerDto } from '../../player/dto/player.dto';
import BasicService from '../../common/service/basicService/BasicService';
import { Player } from '../../player/schemas/player.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlayerRewarder {
  private readonly playerService: BasicService;

  constructor(
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
  ) {
    this.playerService = new BasicService(playerModel);
  }

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

    return this.increasePlayerBatllePoints(player_id, pointAmount);
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
    const result = await this.playerService.updateOneById(player_id, {
      $inc: { points },
    });

    if (result instanceof MongooseError) throw result;

    return [true, null];
  }

  /**
   * Increases specified player battle points amount
   * @param player_id player _id
   * @param battlePoints amount of battle points to increase
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  private async increasePlayerBatllePoints(
    player_id: string,
    battlePoints: number,
  ): Promise<IServiceReturn<true>> {
    if (battlePoints < 0) {
      const [player, errors] =
        await this.playerService.readOneById<PlayerDto>(player_id);

      const currentBattlePoints = player?.battlePoints || 0;
      if (errors) return [null, errors];

      if (currentBattlePoints + battlePoints < 0) {
        battlePoints = -currentBattlePoints;
      }

      if (currentBattlePoints === 0) {
        return [true, null];
      }
    }
    const result = await this.playerService.updateOneById(player_id, {
      $inc: { battlePoints },
    });

    if (result instanceof MongooseError) throw result;

    return [true, null];
  }
}
